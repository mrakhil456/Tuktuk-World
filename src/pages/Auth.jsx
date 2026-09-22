import React, { useEffect, useState } from 'react';

import { Link, useNavigate, useLocation } from 'react-router-dom';

import {
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Mail,
  Smartphone,
  Lock
} from 'lucide-react';

import { useStore } from '../context/StoreContext';

export default function Auth({ mode }) {
  const reg = mode === 'register';
  const navigate = useNavigate();
  const location = useLocation();

  const { api, login } = useStore();

  const [method, setMethod] = useState('password');
  const [step, setStep] = useState('details');

  const [v, setV] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    otp: ''
  });

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  useEffect(() => {
    setMethod('password');
    setStep('details');
    setErr('');
    setDevOtp('');
  }, [reg]);

  const normalize = m =>
    m.replace(/\s+/g, '').replace(/^\+91/, '');

  const goAfterLogin = d => {
    login(d);

    const redirect = new URLSearchParams(location.search).get('redirect');

    const safe =
      redirect && redirect.startsWith('/')
        ? redirect
        : null;

    navigate(
      safe || (d.user.role === 'admin' ? '/admin' : '/shop')
    );
  };

  const passwordSubmit = async e => {
    e.preventDefault();
    setErr('');
    setBusy(true);

    try {
      let r;

      if (reg) {
        r = await api.post('/auth/register-password', {
          name: v.name,
          email: v.email,
          mobile: normalize(v.mobile),
          password: v.password
        });
      } else {
        r = await api.post('/auth/login-password', {
          email: v.email,
          password: v.password
        });
      }

      goAfterLogin(r.data);
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          'Unable to continue.'
      );
    } finally {
      setBusy(false);
    }
  };

  const requestOtp = async e => {
    e?.preventDefault();
    setErr('');

    const mobile = normalize(v.mobile);

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setErr(
        'Enter a valid 10-digit Indian mobile number.'
      );
      return;
    }

    if (
      reg &&
      (!v.name.trim() ||
        !v.email.trim() ||
        v.password.length < 6)
    ) {
      setErr(
        'For OTP registration, enter name, email and a password of at least 6 characters.'
      );
      return;
    }

    setBusy(true);

    try {
      const r = await api.post('/auth/request-otp', {
        mobile,
        mode: reg ? 'register' : 'login',
        ...(reg
          ? {
              name: v.name,
              email: v.email,
              password: v.password
            }
          : {})
      });

      setDevOtp(r.data.devOtp || '');
      setV({ ...v, mobile });
      setStep('otp');
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          'Unable to send OTP.'
      );
    } finally {
      setBusy(false);
    }
  };

  const verify = async e => {
    e.preventDefault();
    setErr('');

    if (!/^\d{6}$/.test(v.otp)) {
      setErr('Enter the 6-digit OTP.');
      return;
    }

    setBusy(true);

    try {
      const r = await api.post('/auth/verify-otp', {
        mobile: normalize(v.mobile),
        otp: v.otp,
        mode: reg ? 'register' : 'login',
        ...(reg
          ? {
              name: v.name,
              email: v.email,
              password: v.password
            }
          : {})
      });

      goAfterLogin(r.data);
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          'OTP verification failed.'
      );
    } finally {
      setBusy(false);
    }
  };

  const title = reg
    ? 'Create your Tuktuk World account'
    : 'Welcome back';

  return (
    <section className="auth">
      <div className="auth-card">
        <span className="eyebrow">
          TUKTUK WORLD{' '}
          <ShieldCheck
            size={14}
            style={{ verticalAlign: '-2px' }}
          />
        </span>

        <h1>{title}</h1>

        <p className="auth-sub">
          {reg
            ? 'Choose how you want to create your account.'
            : 'Login using either your email password or mobile OTP.'}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={
              method === 'password' ? 'active' : ''
            }
            onClick={() => {
              setMethod('password');
              setStep('details');
              setErr('');
            }}
          >
            <Mail size={16} /> Email & Password
          </button>

          <button
            type="button"
            className={
              method === 'otp' ? 'active' : ''
            }
            onClick={() => {
              setMethod('otp');
              setStep(reg ? 'details' : 'mobile');
              setErr('');
            }}
          >
            <Smartphone size={16} /> Mobile OTP
          </button>
        </div>

        {method === 'password' && (
          <form onSubmit={passwordSubmit}>
            {reg && (
              <input
                required
                placeholder="Full name"
                value={v.name}
                onChange={e =>
                  setV({
                    ...v,
                    name: e.target.value
                  })
                }
              />
            )}

            <input
              required
              type="email"
              placeholder="Email address"
              value={v.email}
              onChange={e =>
                setV({
                  ...v,
                  email: e.target.value
                })
              }
            />

            {reg && (
              <input
                required
                inputMode="tel"
                placeholder="Mobile number"
                value={v.mobile}
                onChange={e =>
                  setV({
                    ...v,
                    mobile: e.target.value
                  })
                }
              />
            )}

            <div className="password-field">
              <Lock size={17} />

              <input
                required
                type="password"
                minLength="6"
                placeholder="Password"
                value={v.password}
                onChange={e =>
                  setV({
                    ...v,
                    password: e.target.value
                  })
                }
              />
            </div>

            {err && (
              <p className="error">{err}</p>
            )}

            <button
              className="primary full"
              disabled={busy}
            >
              {busy
                ? 'Please wait...'
                : reg
                ? 'Create account'
                : 'Login'}
            </button>
          </form>
        )}

        {method === 'otp' && (
          <form
            onSubmit={
              step === 'otp' ? verify : requestOtp
            }
          >
            {reg && step === 'details' && (
              <>
                <input
                  required
                  placeholder="Full name"
                  value={v.name}
                  onChange={e =>
                    setV({
                      ...v,
                      name: e.target.value
                    })
                  }
                />

                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={v.email}
                  onChange={e =>
                    setV({
                      ...v,
                      email: e.target.value
                    })
                  }
                />

                <div className="password-field">
                  <Lock size={17} />

                  <input
                    required
                    type="password"
                    minLength="6"
                    placeholder="Create password"
                    value={v.password}
                    onChange={e =>
                      setV({
                        ...v,
                        password: e.target.value
                      })
                    }
                  />
                </div>
              </>
            )}

            {step !== 'otp' && (
              <input
                required
                autoFocus
                inputMode="tel"
                placeholder="10-digit mobile number"
                value={v.mobile}
                onChange={e =>
                  setV({
                    ...v,
                    mobile: e.target.value
                  })
                }
              />
            )}

            {step === 'otp' && (
              <>
                <p className="otp-sent">
                  OTP sent to{' '}
                  <b>
                    +91 {normalize(v.mobile)}
                  </b>
                </p>

                <input
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  value={v.otp}
                  onChange={e =>
                    setV({
                      ...v,
                      otp: e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6)
                    })
                  }
                />

                {devOtp && (
                  <div className="dev-otp">
                    Development OTP:{' '}
                    <b>{devOtp}</b>

                    <small>
                      Shown because a real SMS provider is not configured.
                    </small>
                  </div>
                )}
              </>
            )}

            {err && (
              <p className="error">{err}</p>
            )}

            <button
              className="primary full"
              disabled={busy}
            >
              {busy
                ? 'Please wait...'
                : step === 'otp'
                ? 'Verify OTP & continue'
                : 'Send OTP'}
            </button>

            {step === 'otp' && (
              <>
                <button
                  type="button"
                  className="secondary full"
                  disabled={busy}
                  onClick={() => {
                    setStep(
                      reg ? 'details' : 'mobile'
                    );
                    setV({
                      ...v,
                      otp: ''
                    });
                  }}
                >
                  <ArrowLeft size={16} /> Change mobile
                </button>

                <button
                  type="button"
                  className="secondary full"
                  disabled={busy}
                  onClick={requestOtp}
                >
                  <RefreshCw size={16} /> Resend OTP
                </button>
              </>
            )}
          </form>
        )}

        <p>
          {reg
            ? 'Already have an account? '
            : 'New customer? '}

          <Link
            to={reg ? '/login' : '/register'}
          >
            {reg ? 'Login' : 'Create account'}
          </Link>
        </p>
      </div>
    </section>
  );
}