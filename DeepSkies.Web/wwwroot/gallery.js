(async (api) => {

    const pageSizeIsAlways = 4;

    const domCtx = {

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

        bindClick: (elem, callback) =>
            elem.addEventListener("click", callback),

        loadingReq: false,

        login: {
            success: () => {
                domCtx.login.area.textContent = "Welcome!";
                domCtx.updateStatus("Successfully logged in.");
            },
            fail: () => {
                domCtx.updateStatus("Login failed. Please try again!");
            },
            area: document.querySelector("#login"),
            button: document.querySelector("#loginBtn"),
            username: document.querySelector("#username"),
            password: document.querySelector("#password"),
        },

        prev: document.querySelector("#prev"),

        next: document.querySelector("#next"),

        loading: document.querySelector("#loading"),

        detail: document.querySelector("#detail"),

        toggleDetail: async (on, tgt) => {
            domCtx.detail.innerHTML = "";

            domCtx.detail.style.display = on ? "block" : "none";

            if (on) {

                const target = await galleryCtx.getTarget(tgt.folder);

                const date = target.lastCapture === target.firstCapture ?
                    target.firstCapture : `${target.firstCapture} - ${target.lastCapture}`;

                const finalDate = `${date} - ${target.title}`;

                const mainImage = `https://deepskyworkflows.com/${target.imageUrl}`;
                const anchor = domCtx.createElement("a", "See full image.");
                anchor.href = mainImage;
                anchor.target = "_blank";

                var spaceLoc = domCtx.createElement("span", " ");

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

                const p = domCtx.createElement("p", `Focal length: ${f}mm Aperture: ${a}mm F/stop: ${fstop}`);

                let emptyOrExposure = domCtx.createElement("span", "");

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

                const checkLocation = domCtx.createElement("button",
                    "Observation location");

                checkLocation.addEventListener(
                    "click",
                    () => galleryCtx.checkLocation());

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
                domCtx.detail.appendChild(content);
            }
        },

        status: document.querySelector("#status"),

        types: document.querySelector("#types"),

        telescopes: document.querySelector("#telescopes"),

        gallery: document.querySelector("#gallery"),

        init: () => {

            domCtx.login.button.addEventListener("click", () => {
                galleryCtx.login(
                    domCtx.login.username.val,
                    domCtx.login.password.val
                )
            });

            domCtx.detail.addEventListener("click", () => {
                domCtx.toggleDetail(false);
            });

            domCtx.next.addEventListener("click", () => {
                if (domCtx.next.disabled) {
                    return;
                }
                galleryCtx.pageInfo.currentPage++;
                galleryCtx.refresh();
            });

            domCtx.prev.addEventListener("click", () => {
                if (domCtx.prev.disabled) {
                    return;
                }
                galleryCtx.pageInfo.currentPage--;
                galleryCtx.refresh();
            });
        },

        refresh: () => {

            domCtx.gallery.innerHTML = "";

            if (galleryCtx.pageInfo.currentPage > 0) {
                domCtx.prev.removeAttribute("disabled");
                domCtx.prev.disabled = false;
            }
            else {
                domCtx.prev.setAttribute("disabled", "disabled");
                domCtx.prev.disabled = true;
            }

            if (galleryCtx.pageInfo.currentPage < galleryCtx.pageInfo.totalPages) {
                domCtx.next.removeAttribute("disabled");
                domCtx.next.disabled = false;
            }
            else {
                domCtx.next.setAttribute("disabled", "disabled");
                domCtx.next.disabled = true;
            }

            domCtx.gallery.appendChild(domCtx.createElement("p", [
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
                head.addEventListener("click", () => galleryCtx.toggle("title"));

                const date = domCtx.createElement("p", target.firstCapture.substring(0, 10));
                date.classList.add("click");
                date.addEventListener("click", () => galleryCtx.toggle("date"));

                const div = domCtx.createElement("div", [
                    head,
                    img,
                    date]);

                div.classList.add("card");
                ((target) => {
                    img.addEventListener("click", () => {
                        domCtx.toggleDetail(true, target);
                    });
                })(target);

                domCtx.gallery.appendChild(div);
            });
        },

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

        setType: val => domCtx.set("types", val),

        setScope: val => domCtx.set("telescopes", val),

        bind: (list, container, callback) => {

            for (let idx = 0; idx < list.length; idx++) {
                const btn = document.createElement("button");
                btn.textContent = list[idx];

                (function (item) {
                    btn.addEventListener("click", () => callback(item));
                })(list[idx]);

                container.appendChild(btn);
            }
        },

        updateStatus: msg => domCtx.status.textContent = msg,

        updateLoading: () =>
            domCtx.loading.style.display = domCtx.loadingReq ? "block" : "none",
    };

    const galleryCtx = {

        target: {},

        inflightRequest: set => {
            if (set && domCtx.loadingReq) {
                return false;
            }
            domCtx.loadingReq = set;
            setTimeout(domCtx.updateLoading, 100);
            return true;
        },

        checkLocation: async () => {

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
                    }
                    else {
                        domCtx.updateStatus("Location check failed. You must be logged in.");
                    }
                });

           galleryCtx.inflightRequest(false);
        },
        
        login: async () => {
            if (!galleryCtx.inflightRequest(true)) {
                return;
            }
            await fetch('/identity/login?cookieMode=true', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "username": domCtx.login.username.value,
                    "password": domCtx.login.password.value
                })
            }).then(resp => {
                if (resp.ok) {
                    domCtx.login.success();
                }
                else {
                    domCtx.updateStatus("Login failed.");
                }
            }, __ => {
                domCtx.login.fail();
            });
            galleryCtx.inflightRequest(false);
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

        pageInfo: {
            currentPage: 0,
            pageSize: pageSizeIsAlways,
            totalPages: 0,
            totalItems: 0
        },

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

        asyncCount: 0,

        sort: "date",
        sortDesc: true,
    };

    api.init = async () => {
        galleryCtx.inflightRequest(true);
        galleryCtx.types = await fetch("/data/types").then(r => r.json());
        galleryCtx.telescopes = await fetch("/data/telescopes").then(r => r.json());
        domCtx.init();
        domCtx.bind(galleryCtx.types, domCtx.types, galleryCtx.setType);
        domCtx.bind(galleryCtx.telescopes, domCtx.telescopes, galleryCtx.setTelescope);
        galleryCtx.inflightRequest(false);
        await galleryCtx.refresh();
    };

    api.getTypes = () => [...galleryCtx.types];

    api.getTelescopes = () => [...galleryCtx.telescopes];

})(window.galleryApi = window.galleryApi || {});