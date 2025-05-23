export function checkContentOverflow(element: HTMLElement): boolean {
  return element.scrollWidth > element.clientWidth
}

export function createResizeObserver(
  callback: () => void,
  element: HTMLElement
): ResizeObserver {
  const observer = new ResizeObserver(callback)
  observer.observe(element)
  return observer
}

export function createCellStyles(
  width?: string,
  minWidth?: string,
  maxWidth?: string,
  additionalStyles?: React.CSSProperties
): React.CSSProperties {
  return {
    ...additionalStyles,
    ...(width && { width }),
    ...(minWidth && { minWidth }),
    ...(maxWidth && { maxWidth }),
  }
}
