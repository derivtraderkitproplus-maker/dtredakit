// @ts-nocheck - vendored bot code with known upstream type gaps; see AGENTS.md

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { Outlet } from 'react-router-dom';
import { api_base } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import { useDevice } from '@deriv-com/ui';
import { crypto_currencies_display_order, fiat_currencies_display_order } from '../shared';
import Footer from './footer';
import AppHeader from './header';
import Body from './main-body';
import './layout.scss';
import Draggable from 'react-draggable';

const Layout = observer(() => {
    const { isDesktop } = useDevice();
    const store = useStore();
    const [isOpen, setIsOpen] = React.useState(false);
const [position, setPosition] = React.useState({ x: 0, y: 0 });
const dragStartPos = React.useRef({ x: 0, y: 0 });

const handleStart = (e: any, data: any) => {
  dragStartPos.current = { x: data.x, y: data.y };
};

const handleStop = (e: any, data: any) => {
  const deltaX = Math.abs(data.x - dragStartPos.current.x);
  const deltaY = Math.abs(data.y - dragStartPos.current.y);

  if (deltaX < 5 && deltaY < 5) {
    setIsOpen(!isOpen); 
    return;
  }

  const windowWidth = window.innerWidth;
  const element = document.querySelector('.ai-toggle-wrapper');
  if (!element) return;
  const rect = element.getBoundingClientRect();

  const distanceToLeft = rect.left + data.x - dragStartPos.current.x;
  const distanceToRight = windowWidth - (rect.right + data.x - dragStartPos.current.x);

  const padding = 16; 
  if (distanceToLeft < distanceToRight) {
    setPosition({ x: -windowWidth + rect.width + padding * 2, y: data.y });
  } else {
    setPosition({ x: 0, y: data.y });
  }
};

    const is_quick_strategy_active = store?.quick_strategy?.is_open;
    const isCallbackPage = window.location.pathname === '/callback';

    const checkClientAccount = JSON.parse(localStorage.getItem('clientAccounts') ?? '{}');
    const getQueryParams = new URLSearchParams(window.location.search);
    const currency = getQueryParams.get('account') ?? '';
    const accountsList = JSON.parse(localStorage.getItem('accountsList') ?? '{}');
    const isClientAccountsPopulated = Object.keys(accountsList).length > 0;
    const ifClientAccountHasCurrency =
        Object.values(checkClientAccount).some((account: any) => account.currency === currency) ||
        currency === 'demo' ||
        currency === '';
    const [clientHasCurrency, setClientHasCurrency] = useState(ifClientAccountHasCurrency);
    const [isAuthenticating, setIsAuthenticating] = useState(true); // Start with true to prevent flashing

    // Expose setClientHasCurrency to window for global access
    useEffect(() => {
        (window as any).setClientHasCurrency = setClientHasCurrency;

        return () => {
            delete (window as any).setClientHasCurrency;
        };
    }, []);

    const validCurrencies = [...fiat_currencies_display_order, ...crypto_currencies_display_order];
    const query_currency = (getQueryParams.get('account') ?? '')?.toUpperCase();
    const isCurrencyValid = validCurrencies.includes(query_currency);
    const api_accounts: any[][] = [];
    let subscription: { unsubscribe: () => void };

    const validateApiAccounts = ({ data }: any) => {
        //TO do work on this with account switcher
        if (data.msg_type === 'authorize') {
            const account_list = data?.authorize?.account_list || [];
            const account_list_filter = account_list.filter((acc: any) => acc.is_disabled === 0);
            api_accounts.push(account_list_filter || []);
            const allCurrencies = new Set(Object.values(checkClientAccount).map((acc: any) => acc.currency));

            // Skip disabled accounts when checking for missing currency
            const accounts = api_accounts.flat();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let detected_currency = '';
            const hasMissingCurrency = accounts.some(data => {
                if (!allCurrencies.has(data.currency)) {
                    sessionStorage.setItem('query_param_currency', data.currency);
                    return true;
                }
                detected_currency = data.currency;
                return false;
            });

            let hasMissingToken = false;
            let missingTokenCurrency = '';

            for (const acc of account_list_filter) {
                if (acc.loginid && !accountsList[acc.loginid]) {
                    hasMissingToken = true;
                    missingTokenCurrency = acc.currency || '';
                    // Store the missing token's currency in session storage
                    if (missingTokenCurrency) {
                        sessionStorage.setItem('query_param_currency', missingTokenCurrency);
                    }
                    break;
                }
            }

            if (hasMissingCurrency || hasMissingToken) {
                setClientHasCurrency(false);
            } else {
                const account_list_ =
                    account_list_filter?.find((acc: { currency: string }) => acc.currency === currency) ||
                    account_list_filter?.[0];

                let session_storage_currency =
                    sessionStorage.getItem('query_param_currency') || account_list_?.currency || 'USD';

                session_storage_currency = `account=${session_storage_currency}`;
                setClientHasCurrency(true);
                if (!new URLSearchParams(window.location.search).has('account')) {
                    window.history.pushState({}, '', `${window.location.pathname}?${session_storage_currency}`);
                }

                setClientHasCurrency(true);
            }

            if (subscription) {
                subscription?.unsubscribe();
            }
        }
    };

    useEffect(() => {
        if (isCurrencyValid && api_base.api) {
            // Subscribe to the onMessage event
            const is_valid_currency = currency && validCurrencies.includes(currency.toUpperCase());
            if (!is_valid_currency) return;
            subscription = api_base.api.onMessage().subscribe(validateApiAccounts);
        }
    }, []);

    useEffect(() => {
        // Always set the currency in session storage, even if the user is not logged in
        // This ensures the currency is available on the callback page
        setIsAuthenticating(true);
        if (currency) {
            sessionStorage.setItem('query_param_currency', currency);
        }

        // Authentication is now handled by the OAuth flow
        setIsAuthenticating(false);
    }, [isClientAccountsPopulated, isCallbackPage, clientHasCurrency, currency]);

    // Add a state to track if initial authentication check is complete
    const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState(false);

    // Effect to mark initial auth check as complete after a short delay
    useEffect(() => {
        if (!isAuthenticating && !isInitialAuthCheckComplete) {
            // Wait a bit to ensure all state updates have propagated
            const timer = setTimeout(() => {
                setIsInitialAuthCheckComplete(true);
            }, 500); // Give it enough time to stabilize

            return () => clearTimeout(timer);
        }
    }, [isAuthenticating, isInitialAuthCheckComplete]);
const [isDisclaimerOpen, setIsDisclaimerOpen] = React.useState(false);

React.useEffect(() => {
  const hideDisclaimer = localStorage.getItem('hideRiskDisclaimer');
  if (hideDisclaimer !== 'true') {
    setIsDisclaimerOpen(true);
  }
}, []);



    return (
        
        <div
            className={clsx('layout', {
                responsive: isDesktop,
                'quick-strategy-active': is_quick_strategy_active && !isDesktop,
            })}
        >
            {!isCallbackPage && <AppHeader isAuthenticating={isAuthenticating || !isInitialAuthCheckComplete} />}
            <Body>
                      <Outlet />
    </Body>
    {!isCallbackPage && isDesktop && <Footer />}

    {/* AI Floating Button */}
    <Draggable 
        bounds="parent"
        position={position}
        onStart={handleStart}
        onStop={handleStop}
    >
        <div className="ai-floating-btn ai-toggle-wrapper" id="aiToggleBtn">
            <div className="ai-inner-circle">
                <span className="ai-text">AI</span>
                <span className="ai-status-dot"></span>
            </div>
        </div>
    </Draggable>

    {/* Risk Disclaimer Button */}
    <button className="risk-disclaimer-btn" onClick={() => setIsDisclaimerOpen(true)}>
        <svg className="warning-icon" viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z"/>
        </svg>
        Risk Disclaimer
    </button>

    {/* Customized Modal Popup */}
    {isDisclaimerOpen && (
        <div className="deriv-modal-overlay" onClick={() => setIsDisclaimerOpen(false)}>
            <div className="deriv-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="deriv-modal-header">
                    <h2>Risk Disclaimer</h2>
                    <button className="deriv-modal-close-x" onClick={() => setIsDisclaimerOpen(false)}>&times;</button>
                </div>
                
                <div className="deriv-modal-body">
                    <p>Please note that Deriv offers complex derivatives, such as options and contracts for difference ("CFDs"). These products may not be suitable for all clients, and trading them puts you at risk. Please make sure that you understand the risks below, as they will affect your capital. You should not trade with money that you cannot afford to lose.</p>
                    <p>Please note that when trading with real money, you may lose your entire capital due to market fluctuations. Also, currency conversion fees may apply when trading with a currency that differs from your account currency.</p>
                </div>
                
                                <div className="deriv-modal-footer">
                    <button className="deriv-btn-dont" onClick={() => { localStorage.setItem('hideRiskDisclaimer', 'true'); setIsDisclaimerOpen(false); }}>Don't Show Again</button>
                    <button className="deriv-btn-close" onClick={() => setIsDisclaimerOpen(false)}>Close</button>
                </div>
            </div>
        </div>
    )}

    {/* Optional: The popup panel that opens when you click the AI button */}
    {isOpen && <div className="ai-menu-popup">AI Panel Content</div>}
</div> // This closes the main layout container
    );
});

export default Layout;
