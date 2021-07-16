import React, { useState, FC } from 'react';
import NavigationPanel from './NavigationPanel';

type changeLinkFunc = (link: string) => void;

interface Props {
    setWebsiteLink: changeLinkFunc,
    setVisibleLink: changeLinkFunc
    setError: (error: string) => void,
    visibleLink: string,
    webviewRef: React.MutableRefObject<HTMLWebViewElement>
}

const isURLValid = (str: string) => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

const SearchBar: FC<Props> = ({ webviewRef, visibleLink, setWebsiteLink, setError, setVisibleLink }: Props) => {
    const [searchLink, setSearchLink] = useState('');
    const webview = webviewRef.current as any;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearchLink(value);
    };

    const onSubmit = () => {
        if (isURLValid(searchLink)) {
            setError('');
            setWebsiteLink(searchLink);
        } else {
            setError('Введенный текст не является корректной ссылкой');
        }
    }

    const switchPage = (forward: boolean) => {
        if (webview) {
            forward ? webview.goForward() : webview.goBack();

            setTimeout(() => {
                setVisibleLink(webview.getURL())
            }, 500);
        }
    }

    return (
        <div className="search-bar">
            <NavigationPanel onBackClick={() => switchPage(false)} onForwardClick={() => switchPage(true)} />
            <input type='text' onChange={onChange} defaultValue={visibleLink} key={visibleLink} />
            <button className="search" onClick={onSubmit}>Перейти</button>
        </div>
    );
}

export default SearchBar;
