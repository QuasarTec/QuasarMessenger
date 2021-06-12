import React, { FC } from 'react';

interface Props {
    link: string
}

const Frame: FC<Props> = ({ link }: Props) => {
    return <iframe className="browser-frame" src={link} />;
};

export default Frame;
