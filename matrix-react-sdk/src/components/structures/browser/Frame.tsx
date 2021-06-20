import React, { FC } from 'react';

interface Props {
    link: string
}

const Frame: FC<Props> = ({ link }: Props) => (
    <webview
        className="browser-frame"
        // eslint-disable-next-line max-len
        useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
        src={link}
    />
);

export default Frame;
