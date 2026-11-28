// Visit-local route metadata. Native hash links and browser Back/Forward still work.
const entries: { key: string; hash: string }[] = [];
let position = -1;
export function rememberLocation() {
  const state =
    history.state && typeof history.state === "object" ? history.state : {};
  const index = entries.findIndex((e) => e.key === state.maestromateRoute);
  if (index >= 0) {
    position = index;
    entries[index].hash = location.hash;
    return;
  }
  const key = crypto.randomUUID();
  entries.splice(position + 1);
  entries.push({ key, hash: location.hash });
  position = entries.length - 1;
  history.replaceState({ ...state, maestromateRoute: key }, "");
}
export function backToParent(parent: string) {
  rememberLocation();
  if (position > 0 && entries[position - 1].hash === parent) {
    history.back();
    return;
  }
  // A direct deep link may have no in-app parent in history. Replace this level
  // rather than push a synthetic Back entry which would reopen the child.
  history.replaceState(history.state, "", parent);
  entries[position].hash = parent;
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
