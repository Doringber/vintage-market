import { SecondHandMap } from "../components/second-hand-map";
import { getPlaces } from "../data/places-repository";

export default async function MapPage() {
  const places = await getPlaces();

  return (
    <main className="mapPage">
      <header className="mapHeader">
        <h1>מפת יד שנייה</h1>
        <p>
          {places.length} מקומות ברחבי הארץ — ביגודיות ויצו, נקודות איסוף
          פתחון לב, חנויות דנדשה, צ&apos;לסי, אדרת ועוד. השתמשו ב&quot;המיקום
          שלי&quot; כדי למצוא את הסניף הקרוב.
        </p>
        <p className="mapSourcesNote">
          מקורות:{" "}
          <a
            href="https://wizo.org.il/institution/?wpv-type-of-institution%5B%5D=%D7%91%D7%99%D7%92%D7%95%D7%93%D7%99%D7%95%D7%AA"
            target="_blank"
            rel="noreferrer"
          >
            ויצו
          </a>
          {" · "}
          <a
            href="https://www.pitchonlev.org.il/second-hand-clothes/"
            target="_blank"
            rel="noreferrer"
          >
            פתחון לב
          </a>
          {" · "}
          <a
            href="https://www.betterbesecond.com/post/%D7%9C%D7%A7%D7%91%D7%9C-%D7%9B%D7%A1%D7%A3-%D7%A2%D7%9C-%D7%94%D7%91%D7%92%D7%93%D7%99%D7%9D-%D7%A9%D7%9C%D7%99"
            target="_blank"
            rel="noreferrer"
          >
            Better Be Second
          </a>
          {" · "}
          <a
            href="https://www.kan.org.il/content/kan-news/local/269807/"
            target="_blank"
            rel="noreferrer"
          >
            כאן 11
          </a>
        </p>
      </header>

      <SecondHandMap places={places} />
    </main>
  );
}
