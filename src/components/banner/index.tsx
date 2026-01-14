import React from "react";

import "./styles.css";

interface BannerProps {
  title: string;
  description: string;
  imageUrl?: string;
  onClose?: () => void;
}
export const Banner: React.FC<BannerProps> = ({
  title,
  description,
  imageUrl,
  onClose,
}) => {
  return (
    <div className="banner">
      <div className="content-wrapper">
        <h2 className="title">{title}</h2>
        {imageUrl !== undefined && (
          <img className="image" src={imageUrl} alt="" />
        )}
        <p className="description">{description}</p>
        {onClose !== undefined && (
          <button className="button" onClick={onClose}>
            OK
          </button>
        )}
      </div>
    </div>
  );
};
