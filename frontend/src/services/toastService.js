let toastId = 0;
let setToastsRef = null;

export function setToastSetter(setter) {
  setToastsRef = setter;
}

export function pushToast(type, title, message) {
  if (!setToastsRef) return;
  const id = ++toastId;
  setToastsRef((prev) => [...prev, { id, type, title, message }]);
  setTimeout(() => {
    setToastsRef((prev) => prev.filter((t) => t.id !== id));
  }, 4000);
}
