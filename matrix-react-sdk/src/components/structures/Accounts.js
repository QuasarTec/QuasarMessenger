import React from 'react'

export default function Accounts(props){
    const { accounts, createClient, changeIndex, currentIndex } = props;
    const httpRegex = /http/;

    return(
        <div className="mx_AccountsList">
            {
                accounts.map((account, index) => {
                    const { name, pic } = account.profile;
            
                    return(
                        <div className={ `mx_Account ${ currentIndex === index && 'mx_Active' }` }
                             key={ name } 
                             data-index={ index }
                             onClick={ e => changeIndex(e, 'accountIndex') }>
                            <img className='mx_Avatar' src={ httpRegex.test(pic) ? pic : 'https://m.vk.com/images/camera_100.png' }/>
                        </div>
                    )
                })
            }

            <div className='mx_Account mx_CreateAccount' onClick={ createClient }>
                <img src={ require(`../../../res/img/social/plus.png`) }/>
            </div>
        </div>
    )
}