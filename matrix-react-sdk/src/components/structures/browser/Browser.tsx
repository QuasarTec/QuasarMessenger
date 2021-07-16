import React, { FC, useState, useRef } from 'react';
import SearchBar from './SearchBar';
import Frame from './Frame';

type changeLinkFunc = (link: string) => void;

interface Props {
    browserLink: string,
    visibleLink: string,
    setBrowserLink: changeLinkFunc,
    setVisibleLink: changeLinkFunc
}

const Browser: FC<Props> = ({ browserLink, visibleLink, setBrowserLink, setVisibleLink }: Props) => {
    const [error, setError] = useState('');
    const webviewRef = useRef<HTMLWebViewElement>();

    return (
        <div className="browser">
            <SearchBar
                setWebsiteLink={setBrowserLink}
                setVisibleLink={setVisibleLink}
                visibleLink={visibleLink}
                setError={setError}
                webviewRef={webviewRef}
            />

            { error && <p className="danger">{error}</p> }
            { !error && <Frame link={browserLink} webviewRef={webviewRef} /> }
        </div>
    );
};

export default Browser;
