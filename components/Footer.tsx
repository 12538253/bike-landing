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
          <nav className="footer-information" aria-label="업체와 서비스 안내">
            {Object.values(site.informationPages).map((page) => (
              <a href={page.path} key={page.path}>{page.label}</a>
            ))}
          </nav>
        </div>
        <div className="site-footer__business">
          <p>{site.footer.business}, 대표자 {site.business.owner}</p>
          <p>사업자등록번호 {site.business.registrationNumber}</p>
          <p>{site.footer.address}</p>
          <p>{site.footer.contact}</p>
        </div>
        <small>{site.footer.copyright}</small>
      </div>
    </footer>
  );
}
