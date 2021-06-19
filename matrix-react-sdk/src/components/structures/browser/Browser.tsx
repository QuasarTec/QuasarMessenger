import React, { FC, useState } from 'react';
import SearchBar from './SearchBar';
import Frame from './Frame';

interface Props {
    browserLink: string,
    setBrowserLink: (link: string) => void
}

const Browser: FC<Props> = ({ browserLink, setBrowserLink }: Props) => {
    const [error, setError] = useState('');

    return (
        <div className="browser">
            <SearchBar
                setWebsiteLink={setBrowserLink}
                defaultLink={browserLink}
                setError={setError}
            />

            { error && <p className="danger">{error}</p> }
            { !error && <Frame link={browserLink} /> }
        </div>
    );
};

export default Browser;
