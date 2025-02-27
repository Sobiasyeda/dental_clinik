const production = import.meta.env.VITE_PRODUCTION;
const isProduction = import.meta.env.MODE === production;
const basePath = isProduction ? "/static" : "";
const options = [
  {
    value: "+961",
    label: (
      <div className="flag-option">
        <img
          className="flag-img"
          src={`${basePath}/flags/lebanon.png`}
          alt="Lebanon"
        />
        <span className="leb-flag">Leb</span>
      </div>
    ),
  },
  {
    value: "+966",
    label: (
      <div className="flag-option">
        <img
          className="flag-img"
          src={`${basePath}/flags/saudi-arabia.png`}
          alt="KSA"
        />
        <span className="ksa-flag">KSA</span>
      </div>
    ),
  },
  {
    value: "+971",
    label: (
      <div className="flag-option">
        <img
          className="flag-img"
          src={`${basePath}/flags/dubai.png`}
          alt="Dubai"
        />
        <span className="dubai-flag">UAE</span>
      </div>
    ),
  },
  {
    value: "+964",
    label: (
      <div className="flag-option">
        <img
          className="flag-img"
          src={`${basePath}/flags/iraq.png`}
          alt="iraq"
        />
        <span className="dubai-flag">Iraq</span>
      </div>
    ),
  },
  {
    value: "+974",
    label: (
      <div className="flag-option">
        <img
          className="flag-img"
          src={`${basePath}/flags/qatar.png`}
          alt="qatar"
        />
        <span className="dubai-flag">Qatar</span>
      </div>
    ),
  },
  {
    value: "+965",
    label: (
      <div className="flag-option">
        <img
          className="flag-img"
          src={`${basePath}/flags/kuwait.png`}
          alt="kuwait"
        />
        <span className="kuwait-flag">Kuwait</span>
      </div>
    ),
  },
];

export default options;
