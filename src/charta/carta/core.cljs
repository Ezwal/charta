(ns carta.core)

(def TILE-SIZE 16)

(def APP-WIDTH (.-innerWidth js/window))
(def APP-HEIGHT (.-innerHeight js/window))

(defn get-perlin-noise []
  (.seed js/noise (.random js/Math))
  (.-simplex2 js/noise))

(defn paint-perlin-noise [app noise]
  (map (fn [x] (map
                (fn [y]
                  (let [tile (str (tile-selector x y noise) ".png")
                        sprite (js/PIXI.Sprite.
                                (. tile js/PIXI.TextureCache))]
                    (set! (.-width sprite) TILE-SIZE)
                    (set! (.-height sprite) TILE-SIZE)
                    (set!  (.-x sprite x))
                    (set!  (.-y sprite y))
                    (set! (.. app -stage -addChild) sprite)))
                (range 0 APP-HEIGHT TILE-SIZE)))
   (range 0 APP-WIDTH TILE-SIZE)))

(defn main []
  (let [app (js/PIXI.Application. (clj->js {:width APP-WIDTH
                                            :height APP-HEIGHT}))
        loader (.-loader js/PIXI)]
    (set! (.. app -renderer -resize) true)
    (.add loader "images/terrain.json")
    (.on loader "progress"
         (fn [loader, resource]
           (str "loading textures" (.-url resource) " - " (.-progress loader) "%")))))

(main)
