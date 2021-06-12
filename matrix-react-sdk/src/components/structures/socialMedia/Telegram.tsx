import React, { FC } from "react";

const Telegram: FC = () => {
    return <iframe src={ `localhost:${window.telegramPort}/telegram` }></iframe>
};

export default Telegram;
