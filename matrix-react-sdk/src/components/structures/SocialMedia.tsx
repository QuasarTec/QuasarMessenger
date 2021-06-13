import React from 'react';
import { FC } from 'react';
import SocialMediaName from '../../interfaces/SocialMedia';
import VK from './socialMedia/VK';
import Telegram from './socialMedia/Telegram';

interface Props {
  name: SocialMediaName
}

const SocialMedia: FC<Props> = ({ name }: Props) => {
    if (name === SocialMediaName.VK) {
        return <VK name={name} />
    }
    // } else if (name === SocialMediaName.Telegram) {
    //     return <Telegram />
    // }
}

export default SocialMedia;
