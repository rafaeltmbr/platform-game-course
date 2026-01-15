import React, { useEffect } from "react";

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
  useEffect(() => {
    if (!onClose) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", listener);

    return () => document.removeEventListener("keydown", listener);
  }, []);

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
