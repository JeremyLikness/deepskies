(async (api) => {

    // whatever the page size is. Optimizing for 1920x1080 and 4 works best.
    const pageSizeIsAlways = 4;

    const domCtx = {

        // we do a lot of this
        bindClick: (elem, callback) =>
            elem.addEventListener("click", callback),

        // smart enough to handle strings, arrays, and elements
        createElement: (type, content) => {

            const elem = document.createElement(type);

            if (content) {
                if (typeof content === 'string' || content instanceof String) {
                    elem.textContent = content;
                }
                else if (Array.isArray(content)) {
                    for (let idx = 0; idx < content.length; idx++) {
                        elem.appendChild(content[idx]);
                    }
                }
                else {
                    elem.appendChild(content);
                }
            }

            return elem;
        },

        // UI elements for login
        login: {
            area: document.querySelector("#login"),
            button: document.querySelector("#loginBtn"),
            username: document.querySelector("#username"),
            password: document.querySelector("#password"),
        },

        // disable it with attibutes and the DOM property
        disableBtn: btn => {
            btn.setAttribute("disabled", "disabled");
            btn.disabled = true;
        },

        // UI elements for the gallery
        dom: {
            detail: document.querySelector("#detail"),
            gallery: document.querySelector("#gallery"),
            loading: document.querySelector("#loading"),
            next: document.querySelector("#next"),
            prev: document.querySelector("#prev"),
            status: document.querySelector("#status"),
            telescopes: document.querySelector("#telescopes"),
            types: document.querySelector("#types"),
        },

        // enable it with attributes and the DOM property
        enableBtn: btn => {
            btn.removeAttribute("disabled");
            btn.disabled = false;
        },

        // get the value of an element
        formValue: elem => elem.value,

        // show or hide the detail pane (rebuilds it each time)
        toggleDetail: async (on, target) => {

            domCtx.dom.detail.innerHTML = "";

            domCtx.dom.detail.style.display = on ? "block" : "none";

            if (on) {

                const date = target.lastCapture === target.firstCapture ?
                    target.firstCapture : `${target.firstCapture} - ${target.lastCapture}`;

                const finalDate = `${date} - ${target.title}`;

                const mainImage = `https://deepskyworkflows.com/${target.imageUrl}`;
                const anchor = domCtx.createElement("a", "See full image.");
                anchor.href = mainImage;
                anchor.target = "_blank";

                var spaceLoc = domCtx.createElement("span", " ");

                // if we have a location, we can link to the WWT. Right Ascension always implies Dec.
                if (target.ra && target.ra.degrees) {
                    const ra = `RA: ${target.ra.hour}h ${target.ra.minute}m ${target.ra.second}s `;
                    const raIdx = target.ra.hour + (target.ra.minute / 60) + (target.ra.second / 3600);
                    const dec = `DEC: ${target.dec.isNegative ? '-' : '+'}${target.dec.degrees}° ${target.dec.arcMinutes}' ${target.dec.arcSeconds}"`;
                    spaceLoc = domCtx.createElement("a", `Sky location: ${ra} ${dec}`);
                    spaceLoc.href = `https://worldwidetelescope.org/webclient/#ra=${raIdx}&dec=${target.dec.dec}&fov=2`;
                    spaceLoc.target = "_blank";
                }

                const f = target.focalLength;
                const a = target.aperture;
                const fstop = f / a;

                // f-stop measures light gathering ability. The lower the number, the better. It makes sense that a bigger aperture
                // (the opening of the lens) lets in more light. So, a 200mm lens with a 50mm aperture is f/4. A 200mm lens with a  
                // 20mm aperture is f/10. The f-stop is the ratio of the focal length to the aperture. So, f/4 is 200/50 and f/10 is 200/20.
                const p = domCtx.createElement("p", `Focal length: ${f}mm Aperture: ${a}mm F/stop: ${fstop}`);

                let emptyOrExposure = domCtx.createElement("span", "");

                // the light required for a good space photograph is more than a typical exposure can handle. The problem is that the earth
                // rotates while filming, so the stars will move and "streak" or cause "star trails." A mount designed to track the stars is
                // helpful, but also limited. It is also possible to over expose and oversaturate the image. So, we need to take multiple
                // exposures and combine them. This is called "stacking." The exposure is the amount of time the shutter is open. The longer
                // it is open, the more light is let in. The more light, the more detail. 
                if (target.exposure) {
                    const e = target.exposure;
                    const l = target.lights;
                    const total = e * l;
                    const hExposure = total > 3600 ? Math.floor(total / 3600) : 0;
                    const mExposure = total > 60 ? Math.floor((total - (hExposure * 3600)) / 60) : 0;
                    const sExposure = total - (hExposure * 3600) - (mExposure * 60);
                    const duration = hExposure > 0 ? `${hExposure}h ${mExposure}m ${sExposure}s` : `${mExposure}m ${sExposure}s`;

                    emptyOrExposure = domCtx.createElement("p", `Exposure: ${e}s Subs: ${l} Total exposure: ${duration}`);
                }

                // what super secret location was this taken at? We can't tell you, but we can show you on a map.
                const checkLocation = domCtx.createElement(
                    "button",
                    "Observation location");

                domCtx.bindClick(
                    checkLocation,
                    () => galleryCtx.checkLocation());

                // then you put it all together...
                const content = domCtx.createElement("div",
                    [
                        domCtx.createElement("h3", finalDate.substring(0, 10)),
                        domCtx.createElement("p", target.description),
                        p,
                        emptyOrExposure,
                        domCtx.createElement("div", [
                            domCtx.createElement("p", anchor),
                            domCtx.createElement("p", spaceLoc),
                            checkLocation])
                    ]);
                domCtx.dom.detail.appendChild(content);
            }
        },

        // simple enough
        updateText: (elem, text) => elem.textContent = text,

        // set up all UI interactions
        init: () => {

            domCtx.bindClick(domCtx.login.button, () => {
                galleryCtx.login(
                    domCtx.formValue(domCtx.login.username),
                    domCtx.formValue(domCtx.login.password)
                )
            });

            domCtx.bindClick(domCtx.dom.detail, () => {
                domCtx.toggleDetail(false);
            });

            domCtx.bindClick(domCtx.dom.next, () => {

                if (domCtx.dom.next.disabled) {
                    return;
                }

                galleryCtx.pageInfo.currentPage++;
                galleryCtx.refresh();
            });

            domCtx.bindClick(domCtx.dom.prev, () => {

                if (domCtx.dom.prev.disabled) {
                    return;
                }
                galleryCtx.pageInfo.currentPage--;
                galleryCtx.refresh();
            });
        },

        // used to reissue the request when the filters or sorts change
        refresh: () => {

            domCtx.dom.gallery.innerHTML = "";

            if (galleryCtx.pageInfo.currentPage > 0) {
                domCtx.enableBtn(domCtx.dom.prev);
            }
            else {
                domCtx.disableBtn(domCtx.dom.prev);
            }

            if (galleryCtx.pageInfo.currentPage < galleryCtx.pageInfo.totalPages) {
                domCtx.enableBtn(domCtx.dom.next);
            }
            else {
                domCtx.disableBtn(domCtx.dom.next);
            }

            domCtx.dom.gallery.appendChild(domCtx.createElement("p", [
                domCtx.createElement("span",
                    `Sorting by ${galleryCtx.sort} in ${galleryCtx.sortDesc ? 'descending' : 'ascending'} order. Tap the title or date to change the sort.`),
                domCtx.createElement("span",
                    ` Tap the image for details.`)]));

            galleryCtx.types.forEach(target => {

                const img = new Image();
                img.title = target.description;
                img.alt = target.description;
                img.src = `https://deepskyworkflows.com/${target.thumbnailUrl}`;
                img.classList.add("clickable");

                const head = domCtx.createElement("strong", target.title);
                head.classList.add("clickable");
                domCtx.bindClick(head, () => galleryCtx.toggle("title"));

                const date = domCtx.createElement("p", target.firstCapture.substring(0, 10));
                date.classList.add("click");
                domCtx.bindClick(date, () => galleryCtx.toggle("date"));

                const div = domCtx.createElement("div", [
                    head,
                    img,
                    date]);

                div.classList.add("card");
                ((t) => {
                    domCtx.bindClick(img, async () => {
                        const target = await galleryCtx.getTarget(t.folder);
                        domCtx.toggleDetail(true, target);
                    });
                })(target);

                domCtx.dom.gallery.appendChild(div);
            });
        },

        // helps with the filters by setting the current value
        set: (property, val) => {
                
            const old = document.querySelector(`#${property} button.current`);

            if (old) {
                old.classList.remove("current");
                if (old.textContent === val) {
                    return;
                }
            }

            const btns = document.querySelectorAll(`#${property} button`);

            btns.forEach(btn => {
                if (btn.textContent === val) {
                    btn.classList.add("current");
                }
            });
        },

        // set the type of image
        setType: val => domCtx.set("types", val),

        // set the telescope that was used
        setScope: val => domCtx.set("telescopes", val),

        // bind a list of options to a parent container
        bind: (list, container, callback) => {

            for (let idx = 0; idx < list.length; idx++) {
                const btn = document.createElement("button");
                btn.textContent = list[idx];

                (function (item, btn) {
                    domCtx.bindClick(btn, () => callback(item));
                })(list[idx], btn);

                container.appendChild(btn);
            }
        },

        // misc. status
        updateStatus: msg => domCtx.dom.status.textContent = msg,

        // loading indicator
        updateLoading: () =>
            domCtx.dom.loading.style.display = galleryCtx.loadingReq ? "block" : "none",
    };

    const galleryCtx = {

        // current detail
        target: {},

        // true when a request is in flight
        loadingReq: false,
    
        // toggle loading state. Use a delay for fast results so it doesn't "flicker."
        inflightRequest: set => {
            if (set && galleryCtx.loadingReq) {
                return false;
            }
            galleryCtx.loadingReq = set;
            setTimeout(domCtx.updateLoading, 100);
            return true;
        },

        // is there a location?
        checkLocation: async () => {

            // avoid stacked requests
            if (!galleryCtx.inflightRequest(true)) {
                return;
            }

            await fetch(`/personaldata/observation/${galleryCtx.target.folder}`)
                .then(async res => {
                    if (res.ok) {
                        domCtx.updateStatus("Location check succeeded. Launching...");
                        let url = await res.text();
                        url = url.substring(1, url.length - 1);
                        window.open(url);
                        return;
                    }

                    if (res.status === 401) {
                        domCtx.updateStatus("Location check failed. You must be logged in.");
                        return;
                    }

                    if (res.status === 404) {
                        domCtx.updateStatus("No location exists for this observation.");
                    }

                    domCtx.updateStatus("An unknown error occurred.");
                });

            galleryCtx.inflightRequest(false);
        },

        login: async (username, password) => {

            if (!galleryCtx.inflightRequest(true)) {
                return;
            }

            // me like cookie (they "just work")
            await fetch('/identity/login?cookieMode=true', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "username": username,
                    "password": password
                })
            }).then(resp => {
                if (resp.ok) {
                    galleryCtx.loginSuccess();
                }
                else {
                    galleryCtx.loginFail();
                }
            });
            galleryCtx.inflightRequest(false);
        },

        loginSuccess: () => {
            domCtx.updateText(domCtx.login.area, "Welcome!");
            domCtx.updateStatus("Successfully logged in.");
        },

        loginFail: () => {
            domCtx.updateStatus("Login failed. Please try again!");
        },

        getTarget: async folder => {
            if (galleryCtx.inflightRequest(true)) {
                const result = await fetch(`/data/target/${folder}`)
                    .then(response => response.json());
                galleryCtx.inflightRequest(false);
                galleryCtx.target = result;
                return result;
            }
        },

        // keep track for paging
        pageInfo: {
            currentPage: 0,
            pageSize: pageSizeIsAlways,
            totalPages: 0,
            totalItems: 0
        },

        // types of images
        types: [],
        type: null,

        setType: async (val) => {
            galleryCtx.type = galleryCtx.type === val ? null : val;
            domCtx.setType(val);
            domCtx.updateStatus(`Setting type to ${val}...`);
            await galleryCtx.refresh();
        },

        setTelescope: async (val) => {
            galleryCtx.telescope = galleryCtx.telescope === val ? null : val;
            domCtx.setScope(val);
            domCtx.updateStatus(`Setting telescope to ${val}...`);
            await galleryCtx.refresh();
        },

        // reload those queries
        refresh: async () => {

            if (!galleryCtx.inflightRequest(true)) {
                return;
            }

            const type = galleryCtx.type || "all";
            const telescope = galleryCtx.telescope || "all";
            const request = `/data/targets/${type}/${telescope}/${galleryCtx.pageInfo.pageSize}/${galleryCtx.pageInfo.currentPage}?sort=${galleryCtx.sort}&descending=${galleryCtx.sortDesc}`;
            const resp = await fetch(request).then(r => r.json());

            galleryCtx.inflightRequest(false);

            galleryCtx.pageInfo = {
                currentPage: resp.currentPage,
                pageSize: pageSizeIsAlways,
                totalPages: resp.totalPages,
                totalItems: resp.targets.length
            };

            galleryCtx.types = resp.targets;

            domCtx.refresh();

            if (galleryCtx.pageInfo.totalItems < 1) {
                domCtx.updateStatus("No targets found.");
            }
            else {
                domCtx.updateStatus(`Showing page ${galleryCtx.pageInfo.currentPage + 1} of ${galleryCtx.pageInfo.totalPages}.`);
            }
        },

        // sort it out
        toggle: column => {
            if (galleryCtx.sort === column) {
                galleryCtx.sortDesc = !galleryCtx.sortDesc;
            } else {
                galleryCtx.sort = column;
            }
            galleryCtx.refresh();
        },

        telescopes: [],
        telescope: null,

        sort: "date",
        sortDesc: true,
    };

    api.init = async () => {
        galleryCtx.inflightRequest(true);
        galleryCtx.types = await fetch("/data/types").then(r => r.json());
        galleryCtx.telescopes = await fetch("/data/telescopes").then(r => r.json());
        domCtx.init();
        domCtx.bind(galleryCtx.types, domCtx.dom.types, galleryCtx.setType);
        domCtx.bind(galleryCtx.telescopes, domCtx.dom.telescopes, galleryCtx.setTelescope);
        galleryCtx.inflightRequest(false);
        await galleryCtx.refresh();
    };

    api.getTypes = () => [...galleryCtx.types];

    api.getTelescopes = () => [...galleryCtx.telescopes];

})(window.galleryApi = window.galleryApi || {});