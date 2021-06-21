import React, { useState } from 'react';

export default function Accounts(props) {
  const [contextMenuIndex, setContextMenuIndex] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);

  const { accounts, createClient, changeIndex, currentIndex, deleteAccount } = props;

  const httpRegex = /http/;

  const rightClickHanlder = (e, index) => {
    e.preventDefault();

    const { clientX, clientY } = e;

    setContextMenuIndex(index);
    setContextMenuPosition({
      x: clientX,
      y: clientY,
    });
  };

  return (
    <div className="mx_AccountsList">
      {
        accounts.map((account, index) => {
          const { name, pic } = account.profile;

          return (
            <div key={ name }>
              { contextMenuPosition && index === contextMenuIndex &&
                <div className="accountContextMenu" style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}>
                  <button onClick={ () => {
                    setContextMenuPosition(null);
                    deleteAccount(index);
                   } }>Удалить аккаунт</button>
                </div>
              }
              <div className={ `mx_Account ${ currentIndex === index && 'mx_Active' }` }
                  data-index={ index }
                  onClick={ e => changeIndex(e, 'accountIndex') }
                  onContextMenu={ (e) => rightClickHanlder(e, index) }>
                <img className='mx_Avatar' src={ httpRegex.test(pic) ? pic : 'https://m.vk.com/images/camera_100.png' } />
              </div>
            </div>
          );
        })
      }

      <div className='mx_Account mx_CreateAccount' onClick={ createClient }>
        <img src={ require(`../../../res/img/social/plus.png`) } />
      </div>
    </div>
  );
}
