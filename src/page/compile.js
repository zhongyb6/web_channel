import React, { useState } from 'react';

const loadAsync = (name, hook) => new Promise((resolve) => {
    if (name in window.comp) {
        resolve(window.comp[name].default);
        return;
    }
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.onload = () => {
        window.comp[name] = window[name];
        delete window[name];
        resolve(window.comp[name].default);
    };
    script.src = hook;
    document.getElementsByTagName('head')[0].appendChild(script);
});

const handleDragEnter = (el) => {
    if (window.ENV !== 'edit') {
        return;
    }
    const msgEvent = document.createEvent('CustomEvent');

    msgEvent.initCustomEvent(`dragIntoCmp`, true, true, el);
    document.dispatchEvent(msgEvent);
};

const handleDragleave = (el) => {
    if (window.ENV !== 'edit') {
        return;
    }
    const msgEvent = document.createEvent('CustomEvent');

    msgEvent.initCustomEvent(`dragLeaveCmp`, true, true, el);
    document.dispatchEvent(msgEvent);
};

const compileJson2Comp = async ({ el, name, hook, style, props, children, DragIn }) => {
    let Comp = await loadAsync(name, hook);

    return <div key={el} id={el}
        onDragOver={(e) => {
            e.stopPropagation();
            handleDragEnter(el);
        }}
        onDragLeave={(e) => {
            e.stopPropagation();
            handleDragleave(el);
        }}
        style={style}
    >
        <Comp {...props} >
            {await checkChildren(children)}
        </Comp>
    </div>;
};

const checkChildren = async (children) => {
    if (!Array.isArray(children)) {
        return null;
    }
    const res = [];

    for (let i = 0; i < children.length; i++) {
        const comp = await compileJson2Comp(children[i]);

        res.push(comp);
    }

    return res;
};

let initBeforeStr = '';

const Main = (props) => {
    const { init } = props;
    const [page, setPage] = useState(null);

    if (initBeforeStr !== JSON.stringify(init)) {
        initBeforeStr = JSON.stringify(init);
        checkChildren(init).then((page) => {
            setPage(page);
        });
    }

    return page;
};

export default Main;
