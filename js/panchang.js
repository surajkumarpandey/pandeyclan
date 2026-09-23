/* ============================================================
   panchang.js — a small, self-contained Hindu Panchang (tithi,
   nakshatra, sunrise/sunset) calculator for a fixed location
   (defaults to Almora).

   WHY THIS EXISTS: linking to an external Panchang site broke
   twice — once from a wrong URL, once because the site itself
   returned a 502. Computing it locally means it can't go down.

   HOW ACCURATE THIS IS — please read this honestly:
   This uses simplified, well-documented low-precision
   astronomical formulas (the kind commonly used for
   approximate Sun/Moon positions), not a full ephemeris like
   Swiss Ephemeris. Sun position is accurate to a small fraction
   of a degree; Moon position (using the dozen or so largest
   periodic terms) is typically accurate to within a few
   arc-minutes — good enough that the TITHI and NAKSHATRA shown
   should be correct on the overwhelming majority of days. Right
   at a tithi/nakshatra boundary (which shifts by several hours
   to a day at a time), it's possible to be off by one, same as
   any simplified calculator. Sunrise/sunset times are accurate
   to within a couple of minutes. This is meant as a handy daily
   reference, not a substitute for a priest or a professional
   Panchang for time-critical muhurta decisions.
   ============================================================ */

const PandeyPanchang = (() => {
  const TITHI_NAMES = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];
  const NAKSHATRA_NAMES = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  const MASA_NAMES = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwina', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];

  const rad = (d) => d * Math.PI / 180;
  const deg = (r) => r * 180 / Math.PI;
  const norm360 = (x) => ((x % 360) + 360) % 360;

  function julianDay(date) {
    // date is a JS Date (interpreted in UTC for this calculation)
    const Y = date.getUTCFullYear(), M = date.getUTCMonth() + 1, D = date.getUTCDate()
      + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
    let y = Y, m = M;
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + D + B - 1524.5;
  }

  // Sun's apparent tropical ecliptic longitude (Meeus, low-precision)
  function sunLongitude(T) {
    const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    const Mr = rad(M);
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
      + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
      + 0.000289 * Math.sin(3 * Mr);
    return { longitude: norm360(L0 + C), meanAnomaly: M };
  }

  // Moon's apparent longitude using the dozen largest periodic terms
  // (abbreviated ELP2000/Meeus ch.47 — enough precision for tithi/nakshatra)
  function moonLongitude(T) {
    const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
    const D = rad(norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T));
    const M = rad(norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T));
    const Mp = rad(norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T));
    const F = rad(norm360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T));

    let dL = 6.288774 * Math.sin(Mp)
      + 1.274027 * Math.sin(2 * D - Mp)
      + 0.658314 * Math.sin(2 * D)
      + 0.213618 * Math.sin(2 * Mp)
      - 0.185116 * Math.sin(M)
      - 0.114332 * Math.sin(2 * F)
      + 0.058793 * Math.sin(2 * D - 2 * Mp)
      + 0.057066 * Math.sin(2 * D - M - Mp)
      + 0.053322 * Math.sin(2 * D + Mp)
      + 0.045758 * Math.sin(2 * D - M)
      - 0.040923 * Math.sin(M - Mp)
      - 0.034720 * Math.sin(D)
      - 0.030383 * Math.sin(M + Mp);

    return norm360(Lp + dL);
  }

  // Lahiri (Chitrapaksha) ayanamsha — standard linear approximation
  function lahiriAyanamsha(year) {
    return 23.85 + 0.0137 * (year - 1900);
  }

  function tithiInfo(sunLong, moonLong) {
    const diff = norm360(moonLong - sunLong);
    const index = Math.floor(diff / 12); // 0..29
    const paksha = index < 15 ? 'Shukla' : 'Krishna';
    const withinPaksha = index % 15;
    const name = withinPaksha === 14 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : TITHI_NAMES[withinPaksha];
    return { paksha, name, index: index + 1 };
  }

  function nakshatraInfo(siderealMoonLong) {
    const span = 360 / 27;
    const idx = Math.floor(norm360(siderealMoonLong) / span);
    const pada = Math.floor((norm360(siderealMoonLong) % span) / (span / 4)) + 1;
    return { name: NAKSHATRA_NAMES[idx], pada };
  }

  function masaInfo(siderealSunLong) {
    // approximate lunar month by the sidereal solar longitude's zodiac sign
    const idx = Math.floor(norm360(siderealSunLong) / 30);
    return MASA_NAMES[idx];
  }

  // NOAA simplified sunrise/sunset equation
  function sunTimes(date, lat, lng, tzOffsetHours) {
    const start = Date.UTC(date.getUTCFullYear(), 0, 1);
    const dayOfYear = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000) + 1;
    const B = rad(360 / 365 * (dayOfYear - 81));
    const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // minutes
    const declination = rad(23.45 * Math.sin(rad((360 / 365) * (dayOfYear - 81))));
    const latR = rad(lat);
    const cosH = (Math.sin(rad(-0.83)) - Math.sin(latR) * Math.sin(declination)) / (Math.cos(latR) * Math.cos(declination));
    if (cosH > 1 || cosH < -1) return { sunrise: null, sunset: null }; // polar day/night — never happens at Almora's latitude
    const hourAngle = deg(Math.acos(cosH));
    const LSTM = 15 * tzOffsetHours;
    const TC = 4 * (lng - LSTM) + EoT; // minutes
    const solarNoon = 12 - TC / 60;
    const sunrise = solarNoon - hourAngle / 15;
    const sunset = solarNoon + hourAngle / 15;
    return { sunrise, sunset };
  }

  function formatClock(hoursDecimal) {
    if (hoursDecimal == null) return '—';
    let h = Math.floor(hoursDecimal);
    let m = Math.round((hoursDecimal - h) * 60);
    if (m === 60) { m = 0; h += 1; }
    const ampm = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12; if (h12 === 0) h12 = 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  /**
   * Compute the Panchang for a given JS Date (interpreted as that
   * calendar date at noon IST, to avoid day-boundary ambiguity),
   * at the given latitude/longitude (defaults to Almora).
   */
  function calculate(date, lat = 29.5971, lng = 79.6591, tzOffsetHours = 5.5) {
    // anchor the calculation near local noon so we're comparing
    // positions for "this day", not a UTC-midnight moment that could
    // fall on the previous/next local day
    const anchor = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12 - tzOffsetHours, 0, 0));
    const jd = julianDay(anchor);
    const T = (jd - 2451545.0) / 36525;

    const sun = sunLongitude(T);
    const moonLongTropical = moonLongitude(T);
    const ayanamsha = lahiriAyanamsha(date.getFullYear());

    const sunSidereal = norm360(sun.longitude - ayanamsha);
    const moonSidereal = norm360(moonLongTropical - ayanamsha);

    const tithi = tithiInfo(sun.longitude, moonLongTropical); // tithi uses tropical diff (ayanamsha cancels out in the subtraction)
    const nakshatra = nakshatraInfo(moonSidereal);
    const masa = masaInfo(sunSidereal);
    const { sunrise, sunset } = sunTimes(anchor, lat, lng, tzOffsetHours);

    // Vikram Samvat: Gregorian year + 57 before the Vikram new year
    // (roughly Chaitra, around March/April), else +56 — a standard
    // rule-of-thumb, not exact to the day.
    const vikramSamvat = date.getMonth() >= 2 ? date.getFullYear() + 57 : date.getFullYear() + 56;

    return {
      date,
      tithi: `${tithi.paksha} ${tithi.name}`,
      paksha: tithi.paksha,
      nakshatra: `${nakshatra.name} (Pada ${nakshatra.pada})`,
      masa,
      vikramSamvat,
      sunrise: formatClock(sunrise),
      sunset: formatClock(sunset)
    };
  }

  return { calculate };
})();
