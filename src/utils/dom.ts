export const disableContextMenu = () => {
  const eventListener = (event: Event) => event.preventDefault();

  document.addEventListener("contextmenu", eventListener);
  return () => document.removeEventListener("contextmenu", eventListener);
};
