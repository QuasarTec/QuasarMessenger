import React from 'react';
import { FC } from 'react';

interface Props {
  onBackClick: () => void,
  onForwardClick: () => void,
}

enum Labels {
  Back = 'Back',
  Forward = 'Forward'
}

interface Button {
  icon: string, //change
  key: Labels
}

interface ButtonProps extends Button {
  onClick: () => void
}

const buttons: Button[] = [
  {
    icon: require('../../../../res/img/arrows/back.png'),
    key: Labels.Back,
  },
  {
    icon: require('../../../../res/img/arrows/forward.png'),
    key: Labels.Forward,
  },
];

const NavigationButton: FC<ButtonProps> = ({ icon, onClick }: ButtonProps) => (
    <button className="browser-nav-button" onClick={onClick}>
        <img src={icon} />
    </button>
);

const NavigationPanel: FC<Props> = ({ onBackClick, onForwardClick }: Props) => (
    <>
        {
            buttons.map(({ icon, key }) => (
                <NavigationButton icon={icon} onClick={key === Labels.Back ? onBackClick : onForwardClick} key={key} />
            ))
        }
    </>
);

export default NavigationPanel;
