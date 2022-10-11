const ZOOM_FACTOR = 0.1;
const ZOOM_FACTOR_IN = 1 + ZOOM_FACTOR;
const ZOOM_FACTOR_OUT = 1 - ZOOM_FACTOR;
export const types = {
  PAN: 'PAN',
  PAN_START: 'PAN_START',
  ZOOM: 'ZOOM',
  RESET: 'RESET'
};
export const startPan = (event) => ({
  type: types.PAN_START,
  clientX: event.clientX,
  clientY: event.clientY,
});
export const pan = (event) => ({
  type: types.PAN,
  clientX: event.clientX,
  clientY: event.clientY,
});
export const zoom = (event, containerRect) => ({
  type: types.ZOOM,
  zoomFactor: event.deltaY < 0 ? ZOOM_FACTOR_IN : ZOOM_FACTOR_OUT,
  clientX: event.clientX,
  clientY: event.clientY,
  containerRect: containerRect,
});