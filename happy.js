document.addEventListener('DOMContentLoaded', () => {

    const COLORS = [
        '#F6C1CC', '#F8D0B8', '#F9E7A8', '#FFF1B8', '#CDE8D5',
        '#DDEBCF', '#CFE3F6', '#D8D6F2', '#E3CFF2', '#F4B7A7'
    ];

    let selectedOutlineColor = null;
    let selectedFillColor = null;

    // Bolinha que segue o rato
    const cursorDot = document.createElement('div');
    cursorDot.id = 'cursor-dot';
    document.body.appendChild(cursorDot);

    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
    });

    // Criar swatches
    function buildSwatches(containerId, onSelect) {
        const container = document.getElementById(containerId);
        COLORS.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'swatch';
            btn.style.backgroundColor = color;
            btn.title = color;
            btn.addEventListener('click', () => {
                container.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
                btn.classList.add('selected');
                onSelect(color);
            });
            container.appendChild(btn);
        });
    }

    buildSwatches('swatches-outline', (color) => {
        selectedOutlineColor = color;
        const svgEl = document.querySelector('.flower-container svg');
        if (svgEl) svgEl.style.fill = color;
    });

    buildSwatches('swatches-fill', (color) => {
        selectedFillColor = color;
        cursorDot.style.backgroundColor = color;
        cursorDot.classList.add('active');
    });

    // Descobre quais classes CSS têm fill branco no <style> interno do SVG
    function getWhiteClasses(svgEl) {
        const whiteClasses = new Set();
        svgEl.querySelectorAll('style').forEach(styleTag => {
            const css = styleTag.textContent;
            // Apanha padrões como: .cls-1 { fill: #fff; }
            const regex = /\.([a-zA-Z0-9_-]+)\s*\{[^}]*fill\s*:\s*(#fff(fff)?|white|rgb\(255,\s*255,\s*255\))\s*;[^}]*\}/gi;
            let match;
            while ((match = regex.exec(css)) !== null) {
                whiteClasses.add(match[1]);
            }
        });
        return whiteClasses;
    }

    // Carregar SVG
    const total = 18;
    const random = Math.floor(Math.random() * total) + 1;
    const path = `flores/Prancheta ${random}.svg`;

    fetch(path)
        .then(res => res.text())
        .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgEl = svgDoc.querySelector('svg');

            // 1. Descobrir classes brancas ANTES de alterar o CSS
            const whiteClasses = getWhiteClasses(svgEl);

            // 2. Substituir no CSS interno: branco → transparente, preto → #2b1a0c
            svgEl.querySelectorAll('style').forEach(styleTag => {
                let css = styleTag.textContent;
                css = css.replace(/fill\s*:\s*(#fff(fff)?|white|rgb\(255,\s*255,\s*255\))\s*;/gi, 'fill: transparent;');
                css = css.replace(/fill\s*:\s*(#000(000)?|black|rgb\(0,\s*0,\s*0\))\s*;/gi, 'fill: #2b1a0c;');
                styleTag.textContent = css;
            });

            // 3. Cor base do SVG para elementos sem fill (herdam o preto)
            svgEl.style.fill = '#2b1a0c';

            // 4. Substituir atributos fill diretos
            svgEl.querySelectorAll('[fill]').forEach(el => {
                const fill = el.getAttribute('fill');
                if (isBlack(fill)) el.setAttribute('fill', '#2b1a0c');
                if (isWhite(fill)) el.setAttribute('fill', 'none');
            });

            // 5. Para cada elemento com classe branca: adicionar interatividade
            whiteClasses.forEach(cls => {
                svgEl.querySelectorAll(`.${cls}`).forEach(el => {
                    el.style.fill = '#F4EFEA'; // cor do fundo da página = "invisível"


                    el.addEventListener('click', () => {
                        if (selectedFillColor) el.style.fill = selectedFillColor;
                    });
                });
            });

            const container = document.querySelector('.flower-container');
            container.appendChild(svgEl);
        })
        .catch(err => console.error('Erro ao carregar SVG:', err));

});

function isBlack(color) {
    if (!color) return false;
    const c = color.trim().toLowerCase();
    return c === '#000000' || c === '#000' || c === 'black' || c === 'rgb(0,0,0)' || c === 'rgb(0, 0, 0)';
}

function isWhite(color) {
    if (!color) return false;
    const c = color.trim().toLowerCase();
    return c === '#ffffff' || c === '#fff' || c === 'white' || c === 'rgb(255,255,255)' || c === 'rgb(255, 255, 255)';
}