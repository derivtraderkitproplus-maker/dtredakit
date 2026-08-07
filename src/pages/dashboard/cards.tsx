// @ts-nocheck — vendored bot code with known upstream type gaps; see AGENTS.md
// TODO: Complete MobX integration for popup functionality
// Some code is kept commented out pending popup integration
import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import GoogleDrive from '@/components/load-modal/google-drive';
import Dialog from '@/components/shared_ui/dialog';
import MobileFullPageModal from '@/components/shared_ui/mobile-full-page-modal';
import Text from '@/components/shared_ui/text';
import { DBOT_TABS } from '@/constants/bot-contents';
import { useStore } from '@/hooks/useStore';
import {
    DerivLightBotBuilderIcon,
    DerivLightGoogleDriveIcon,
    DerivLightLocalDeviceIcon,
    DerivLightMyComputerIcon,
    DerivLightQuickStrategyIcon,
} from '@deriv/quill-icons/Illustration';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
/* [AI] - Analytics event tracking removed - see migrate-docs/MONITORING_PACKAGES.md for re-implementation guide */
/* [/AI] */
import DashboardBotList from './bot-list/dashboard-bot-list';

type TCardProps = {
    has_dashboard_strategies: boolean;
    is_mobile: boolean;
};

type TCardArray = {
    id: string;
    icon: React.ReactElement;
    content: React.ReactElement;
    callback: () => void;
};

const Cards = observer(({ is_mobile, has_dashboard_strategies }: TCardProps) => {
    const { dashboard, load_modal, quick_strategy, google_drive } = useStore();
    const { toggleLoadModal, setActiveTabIndex } = load_modal;
    const { is_google_drive_configured } = google_drive;
    const { isDesktop } = useDevice();
    const { onCloseDialog, dialog_options, is_dialog_open, setActiveTab, setPreviewOnPopup } = dashboard;
    const { setFormVisibility } = quick_strategy;

    const openFileLoader = () => {
        toggleLoadModal();
        setActiveTabIndex(is_mobile ? 0 : 1);
        setActiveTab(DBOT_TABS.BOT_BUILDER);
    };

    const openGoogleDriveDialog = () => {
        const google_drive_tab_index = isDesktop ? 2 : 1;
        toggleLoadModal();
        setActiveTabIndex(google_drive_tab_index); // Google Drive tab index
        setActiveTab(DBOT_TABS.BOT_BUILDER);
    };

    const actions: TCardArray[] = [
        {
            id: 'my-computer',
            icon: is_mobile ? (
                <DerivLightLocalDeviceIcon height='48px' width='48px' />
            ) : (
                <DerivLightMyComputerIcon height='48px' width='48px' />
            ),
            content: is_mobile ? <Localize i18n_default_text='Local' /> : <Localize i18n_default_text='My computer' />,
            callback: () => {
                openFileLoader();
                /* [AI] - Analytics event tracking removed - see migrate-docs/MONITORING_PACKAGES.md for re-implementation guide */
                /* [/AI] */
            },
        },
        {
            id: 'google-drive',
            icon: <DerivLightGoogleDriveIcon height='48px' width='48px' />,
            content: <Localize i18n_default_text='Google Drive' />,
            callback: () => {
                openGoogleDriveDialog();
                /* [AI] - Analytics event tracking removed - see migrate-docs/MONITORING_PACKAGES.md for re-implementation guide */
                /* [/AI] */
            },
        },
        {
            id: 'bot-builder',
            icon: <DerivLightBotBuilderIcon height='48px' width='48px' />,
            content: <Localize i18n_default_text='Bot Builder' />,
            callback: () => {
                setActiveTab(DBOT_TABS.BOT_BUILDER);
                /* [AI] - Analytics event tracking removed - see migrate-docs/MONITORING_PACKAGES.md for re-implementation guide */
                /* [/AI] */
            },
        },
        {
            id: 'quick-strategy',
            icon: <DerivLightQuickStrategyIcon height='48px' width='48px' />,
            content: <Localize i18n_default_text='Quick strategy' />,
            callback: () => {
                setActiveTab(DBOT_TABS.BOT_BUILDER);
                setFormVisibility(true);
                /* [AI] - Analytics event tracking removed - see migrate-docs/MONITORING_PACKAGES.md for re-implementation guide */
                /* [/AI] */
            },
        },
    ]
        // Hide the Google Drive tile when the feature isn't configured (no GD_* env vars).
        .filter(action => action.id !== 'google-drive' || is_google_drive_configured);

        return React.useMemo(
        () => (
            <div
                className={classNames('tab__dashboard__table', {
                    'tab__dashboard__table--minimized': has_dashboard_strategies && is_mobile,
                })}
            >
                <div
                    className={classNames('tab__dashboard__table__tiles', {
                        'tab__dashboard__table__tiles--minimized': has_dashboard_tiles
                    })}
                    id='tab__dashboard__table__tiles'
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        justifyContent: 'center',
                        width: '100%',
                        padding: '0 8px',
                        boxSizing: 'border-box'
                    }}
                >
                    {actions && actions.map(icons => {
                        const { icon, content, callback, id } = icons;
                        return (
                            <div
                                key={id}
                                className={classNames('tab__dashboard__table__card')}
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '16px 12px', // Slightly adjusted padding for breathability
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                                    transition: 'all 0.2s ease',
                                    minHeight: '160px',
                                    flexShrink: 1,
                                    width: 'calc(50% - 12px)',
                                    minWidth: '140px',
                                    boxSizing: 'border-box',
                                    overflow: 'hidden' // Prevents any rogue elements from bleeding outward
                                }}
                            >
                                <div
                                    className={classNames('tab__dashboard__table__images', {
                                        'tab__dashboard__table__images--minimized': has_dashboard_strategies,
                                    })}
                                    id={id}
                                    style={{ 
                                        width: '100%',
                                        maxWidth: '64px', // Prevents oversized vector graphics/SVGs from cutting off
                                        height: 'auto',
                                        aspectRatio: '1 / 1', // Guarantees a perfect square footprint
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onClick={() => {
                                        if (typeof callback === 'function') callback();
                                    }}
                                >
                                    {icon}
                                </div>
                                <Text 
                                    color='prominent' 
                                    style={{ 
                                        fontWeight: '600', 
                                        fontSize: '14px', 
                                        marginTop: '12px', 
                                        color: '#1c1e21',
                                        textAlign: 'center', // 100% Guarantees centered alignment
                                        width: '100%',        // Spans the safe inside boundary of the card
                                        whiteSpace: 'normal', // Forces long text blocks to drop to new lines
                                        wordBreak: 'break-word', // Breaks exceptionally long individual words safely
                                        overflowWrap: 'anywhere' // Ultimate safety fallback for responsive wrappers
                                    }} 
                                    size={is_mobile ? 'xs' : 's'}
                                >
                                    {content}
                                </Text>
                            </div>
                        );
                    })}

                    {!isDesktop ? (
                        <Dialog
                            title={dialog_options?.title || ''}
                            is_visible={is_dialog_open}
                            onCancel={onCloseDialog}
                            is_mobile_full_width
                            className='dc-dialog__wrapper--google-drive'
                            has_close_icon
                        >
                            <GoogleDrive />
                        </Dialog>
                    ) : (
                        <MobileFullPageModal
                            is_modal_open={is_dialog_open}
                            className='load-strategy__wrapper'
                            header={localize('Load strategy')}
                            onClickClose={() => {
                                if (typeof setPreviewOnPopup === 'function') setPreviewOnPopup(false);
                                if (typeof onCloseDialog === 'function') onCloseDialog();
                            }}
                            height_offset='80px'
                        >
                            <div label='Google Drive' className='google-drive-label'>
                                <GoogleDrive />
                            </div>
                        </MobileFullPageModal>
                    )}
                </div>
                <DashboardBotList />
            </div>
        ),
        [
            is_dialog_open, 
            has_dashboard_strategies, 
            is_google_drive_configured, 
            has_dashboard_tiles, 
            is_mobile, 
            isDesktop, 
            actions, 
            dialog_options, 
            onCloseDialog,
            localize
        ]
    );
});

export default Cards;
