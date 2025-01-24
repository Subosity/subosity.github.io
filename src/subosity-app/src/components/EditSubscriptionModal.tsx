import React, { useRef } from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { Subscription } from '../types';
import SubscriptionForm, { SubscriptionFormRef } from './SubscriptionForm';
import { supabase } from '../supabaseClient';
import { useToast } from '../ToastContext';
import { faChevronLeft, faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
    show: boolean;
    onHide: () => void;
    subscription: Subscription | null;
    onSubmit: (data: Partial<Subscription>) => void;
}

const EditSubscriptionModal: React.FC<Props> = ({ show, onHide, subscription, onSubmit }) => {
    const { addToast } = useToast();
    const formRef = useRef<SubscriptionFormRef>(null);

    const handleSubmit = async (data: Partial<Subscription>) => {
        try {
            if (!subscription?.id) throw new Error('No subscription ID');

            const { error } = await supabase
                .from('subscription')
                .update({
                    subscription_provider_id: data.providerId,
                    nickname: data.nickname,  // Add this line
                    start_date: data.startDate,
                    autorenew: data.autoRenewal,
                    renew_frequency: data.renewalFrequency,
                    amount: data.amount,
                    payment_provider_id: data.paymentProviderId,
                    payment_details: data.paymentDetails,
                    notes: data.notes,
                    is_free_trial: data.isFreeTrial
                })
                .eq('id', subscription.id);

            if (error) throw error;

            addToast('Subscription updated successfully', 'success');
            onSubmit(data);
            onHide();
        } catch (error) {
            console.error('Error updating subscription:', error);
            addToast('Failed to update subscription', 'error');
        }
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="end">
            <Offcanvas.Header closeButton style={{ backgroundColor: 'var(--bs-navbar-bg)', color: 'var(--bs-body-color)' }}>
                <div>
                    <Offcanvas.Title>
                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                        Edit Subscription
                    </Offcanvas.Title>
                    <div style={{ fontSize: '0.85em', opacity: 0.6 }}>
                        Edit an existing subscription.
                    </div>
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <SubscriptionForm
                    ref={formRef}
                    subscription={subscription || undefined}
                    onSubmit={handleSubmit}
                    onCancel={onHide}
                />
            </Offcanvas.Body>
            <div className="p-3 border-top" style={{ backgroundColor: 'var(--bs-navbar-bg)' }}>
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={onHide}>
                        <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
                        Back
                    </Button>
                    <Button variant="primary" onClick={() => formRef.current?.submitForm()}>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </Offcanvas>
    );
};

export default EditSubscriptionModal;