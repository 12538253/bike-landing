import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-shell site-footer__inner">
        <div className="footer-brand">
          <div className="footer-brand__lockup">
            <span className="footer-brand__badge" aria-hidden="true">
              BM
            </span>
            <span>
              <strong>{site.footer.name}</strong>
              <em>{site.footer.englishName}</em>
            </span>
          </div>
          <p>{site.footer.service}</p>
        </div>
        <div className="site-footer__business">
          <p>{site.footer.business}</p>
          <p>{site.footer.address}</p>
          <p>{site.footer.contact}</p>
        </div>
        <small>{site.footer.copyright}</small>
      </div>
    </footer>
  );
}
