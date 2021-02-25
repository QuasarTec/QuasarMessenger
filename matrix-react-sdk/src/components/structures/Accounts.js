import React from 'react'

export default function Accounts(props){
    const { accounts, createClient, changeIndex, currentIndex } = props;

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
                            <img className='mx_Avatar' src={ pic }/>
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