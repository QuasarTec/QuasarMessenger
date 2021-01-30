import Modal from '../../Modal';
import SdkConfig from '../../SdkConfig';
import * as sdk from "../../index";

export default function DonationMenu(updateState, warning){
    const Field = sdk.getComponent('views.elements.Field');

    const onSubmit = e => {
        e.preventDefault();

        const form = document.getElementsByClassName('mx_DonationMenu');
        const { value } = form[0].sum;

        if(!value || value < 1){
            dialog.close();

            updateState({
                donationWarning: "Сумма должна быть не меньше, чем 1 USD"
            });
        }
    }

    const donationDialog = () => (
        <form className="mx_DonationMenu" onSubmit={ onSubmit }>
            <h2>Введите сумму пополнения: </h2>
            <Field label="Сумма в долларах"/>

            { warning && <p className="warning">{ warning }</p> }

            <input type="submit" value="Пополнить"/>
        </form>
    );

    const dialog = Modal.createDialog(donationDialog);
}