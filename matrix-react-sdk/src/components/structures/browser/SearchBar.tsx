import React, { useState, FC } from 'react';

interface Props {
    setWebsiteLink: (link: string) => void,
    setError: (error: string) => void,
    defaultLink?: string
}

const isURLValid = (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

const SearchBar: FC<Props> = ({ setWebsiteLink, defaultLink, setError }: Props) => {
    const [searchLink, setSearchLink] = useState('');

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearchLink(value);
    };

    const onSubmit = () => {
        console.log(searchLink);
        if (isURLValid(searchLink)) {
            setError('');
            setWebsiteLink(searchLink);
        } else {
            setError('Введенный текст не является корректной ссылкой');
        }
    }

    return (
        <div className="search-bar">
            <input type='text' onChange={onChange} defaultValue={defaultLink} />
            <button className="search" onClick={onSubmit}>Перейти</button>
        </div>
    );
}

export default SearchBar;
