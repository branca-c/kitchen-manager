import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

type PageLayoutProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageLayout({
  title,
  subtitle,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <div className="app-frame">
      <Navbar />
      <main className="app-shell app-main">
        {title || subtitle || actions ? (
          <section className="page-header">
            <div>
              {title ? <h1 className="page-title">{title}</h1> : null}
              {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
            </div>
            {actions ? <div className="page-header__actions">{actions}</div> : null}
          </section>
        ) : null}
        {children}
      </main>
    </div>
  );
}
