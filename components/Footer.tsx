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
              <strong>{site.name}</strong>
              <em>{site.englishName}</em>
            </span>
          </div>
          <p>중고 바이크 직접 방문·현장 거래</p>
        </div>
        <div className="site-footer__business">
          <p>상호명 {site.name}</p>
          <p>{site.address.full}</p>
          <p>24시간 문의 가능 · 방문 전 연락 · {site.phone.display}</p>
        </div>
        <small>
          © {site.business.copyrightYear} {site.englishName}. All rights reserved.
        </small>
      </div>
    </footer>
  );
}
