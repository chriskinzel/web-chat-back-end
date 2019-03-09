export interface CSSStyle {
    [key: string]: string | number;
}

export function b(style: CSSStyle, ...children: string[]): string {
    return htmlElement('b', style, ...children);
}

export function span(style: CSSStyle, ...children: string[]): string {
    return htmlElement('span', style, ...children);
}

export function ul(style: CSSStyle, ...children: string[]): string {
    return htmlElement('ul', style, ...children);
}
export function li(style: CSSStyle, ...children: string[]): string {
    return htmlElement('li', style, ...children);
}

export function div(style: CSSStyle, ...children: string[]): string {
    return htmlElement('div', style, ...children);
}

export function htmlElement(tag: string, style: CSSStyle, ...children: string[]): string {
    const styleString = Object.entries(style).map(([key, value]) => `${key}: ${value};`).join('');
    return `<${tag} style="${styleString}">${children.join('')}</${tag}>`;
}
