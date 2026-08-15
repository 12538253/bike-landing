import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-shell site-footer__inner">
        <div>
          <strong>{site.englishName}</strong>
          <p>중고 바이크 직접 방문·현장 거래</p>
        </div>
        <div className="site-footer__business">
          <p>
            상호명 {site.name} · 대표자 {site.business.owner} · 사업자등록번호{
              " "
            }
            {site.business.registrationNumber}
          </p>
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
