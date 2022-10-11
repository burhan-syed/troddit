import { types, zoom } from './actions';
export const initialState = {
  translateX: 0,
  translateY: 0,
  prevMouseX: 0,
  prevMouseY: 0,
  scale: 1,
};
const reducer = (state, action) => {
  switch(action.type) {
    case types.PAN_START:
      return {
        ...state,
        prevMouseX: action.clientX,
        prevMouseY: action.clientY,
      };
    case types.PAN:
      const deltaMouseX = action.clientX - state.prevMouseX;
      const deltaMouseY = action.clientY - state.prevMouseY;
      return {
        ...state,
        translateX: state.translateX + deltaMouseX,
        translateY: state.translateY + deltaMouseY,
        prevMouseX: action.clientX,
        prevMouseY: action.clientY,
      };
    case types.ZOOM:
      const scaledTranslate = getScaledTranslate(state, action.zoomFactor);
      const mousePositionOnScreen = { x: action.clientX, y: action.clientY };
      const zoomOffset = getZoomOffset(action.containerRect, mousePositionOnScreen, action.zoomFactor);
      if (state.scale * action.zoomFactor > 1){
        return {
          ...state,
          scale: state.scale * action.zoomFactor,
          translateX: scaledTranslate.x - zoomOffset.x,
          translateY: scaledTranslate.y - zoomOffset.y,
        };
      }
      else {
        return {
          ...state,
          ...initialState
        }
      }
    case types.RESET: 
      return {
        ...state, 
        ...initialState
      }
    default:
      return state;
  }
};
const getZoomOffset = (containerRect, mousePositionOnScreen, zoomFactor) => {
  const zoomOrigin = {
    x: mousePositionOnScreen.x - containerRect.left,
    y: mousePositionOnScreen.y - containerRect.top,
  }
  const currentDistanceToCenter = {
    x: containerRect.width / 2 - zoomOrigin.x,
    y: containerRect.height / 2 - zoomOrigin.y,
  };
  const scaledDistanceToCenter = {
    x: currentDistanceToCenter.x * zoomFactor,
    y: currentDistanceToCenter.y * zoomFactor,
  }
  const zoomOffset = {
    x: currentDistanceToCenter.x - scaledDistanceToCenter.x,
    y: currentDistanceToCenter.y - scaledDistanceToCenter.y,
  };
  return zoomOffset;
};

const getScaledTranslate = (state, zoomFactor) => {
  return ({
  x: state.translateX * zoomFactor,
  y: state.translateY * zoomFactor,
})};

export default reducer; 