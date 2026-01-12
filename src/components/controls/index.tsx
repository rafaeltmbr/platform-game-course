import React from "react";

import "./styles.css";
import { IoChevronUp } from "react-icons/io5";

export interface ControlsState {
  isUp: boolean;
  didPressUp: boolean;
  isLeft: boolean;
  isRight: boolean;
}

export const controlsState: ControlsState = {
  isUp: false,
  didPressUp: false,
  isLeft: false,
  isRight: false,
};

export const Controls: React.FC = () => {
  return (
    <div className="controls">
      <div className="top-container">
        <div
          className="button left"
          onTouchStart={() => (controlsState.isLeft = true)}
          onTouchEnd={() => (controlsState.isLeft = false)}
        >
          <IoChevronUp />
        </div>
        <div
          className="button right"
          onTouchStart={() => (controlsState.isRight = true)}
          onTouchEnd={() => (controlsState.isRight = false)}
        >
          <IoChevronUp />
        </div>
      </div>
      <div className="bottom-container">
        <div
          className="button up"
          onTouchStart={() => {
            controlsState.isUp = true;
            controlsState.didPressUp = true;
          }}
          onTouchEnd={() => {
            controlsState.isUp = false;
            controlsState.didPressUp = false;
          }}
        >
          <IoChevronUp />
        </div>
      </div>
    </div>
  );
};
