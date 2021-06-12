import React, { FC, useState } from 'react';
import SearchBar from './SearchBar';
import Frame from './Frame';
import Highlighted from './Highlited';

const Browser: FC = () => {
    const [websiteLink, setWebsiteLink] = useState('');
    const [error, setError] = useState('');
    return (
        <div className="browser">
            <SearchBar
                setWebsiteLink={setWebsiteLink}
                defaultLink={websiteLink}
                setError={setError}
            />
            { error && <p className="danger">{error}</p> }
            { websiteLink ?
                (!error && <Frame link={websiteLink} />) :
                <Highlighted setWebsiteLink={setWebsiteLink} />
            }
        </div>
    );
};

export default Browser;
