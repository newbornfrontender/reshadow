const postcss = require('postcss');
const {stripIndent} = require('common-tags');

const reshadow = require('..');

const createTransform = (options = {}) => {
    const processor = postcss([reshadow(options)]);

    return css => processor.process(stripIndent(css), {from: undefined}).css;
};

const transform = createTransform();

describe('postcss', () => {
    it('draft', () => {
        const code = transform`
            button {
                color: red;
            }

            [type="button"][disabled] {
                composes: hahaha;
            }

            button[disabled] {
                color: grey;
                composes: lol;
            }

            button[type="submit"] {
                border: 1px solid red;
            }
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform the code', () => {
        const code = transform`
            button {
                color: red;
            }

            button[disabled] {
                color: grey;
            }

            button[type="submit"] {
                border: 1px solid red;
            }
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform :root', () => {
        const code = transform`
            :root {
                color: red;
            }

            :root[disabled] {
                color: grey;
            }

            :root[type="submit"] {
                border: 1px solid red;
            }
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform the code with namespaces', () => {
        const code = transform`
            |button,
            use|button {
                color: red;
            }

            button use|content,
            button |content {
                font-weight: bold;
            }

            button[|disabled],
            button[use|disabled] {
                color: grey;
            }

            button[|size="m"],
            button[use|size="m"] {
                font-size: 14px;
            }
        `;

        expect(code).toMatchSnapshot();
    });

    it('should should keep elements under the :global', () => {
        const code = transform`
            content :global(button) {
                color: red;
            }

            button:global([aria-hidden]) {
                opacity: 0;
            }

            button:global([disabled])[|variant=normal] {
                background-color: gray;
            }

            :global(:root) {
                padding: 10px;
            }
        `;

        expect(code).toMatchSnapshot();
    });

    it('should should not transform keyframes', () => {
        const code = transform`
            @keyframes anim {
                from {
                    transform: translateX(-10px);
                }
                to {
                    transform: translateX(0);
                }
            }
        `;

        expect(code).toMatchSnapshot();
    });

    it('should should not transform pseudo-classes like :nth-child', () => {
        const code = transform`
            tr:nth-child(2n) {
                color: red;
            }

            :dir(rtl) {
                background-color: red;
            }
        `;

        expect(code).toMatchSnapshot();
    });

    describe('stats', () => {
        const transform = createTransform({stats: true});

        it('should transform the code with stats', () => {
            const code = transform`
                [type="submit"] {
                    padding: 10px;
                }

                button {
                    color: red;
                }

                button[disabled] {
                    color: grey;
                }

                button[type="submit"] {
                    border: 1px solid red;
                }

                button[use|size="s"] {
                    font-size: 14px;
                }
            `;

            expect(code).toMatchSnapshot();
        });
    });

    describe('bem', () => {
        const transform = createTransform({bem: true});

        it.skip('should transform the code with bem', () => {
            const code = transform`
                __button {
                    color: red;
                }

                __button[disabled] {
                    color: grey;
                }

                __button[_size="m"] {
                    font-size: 14px;
                }
            `;

            expect(code).toMatchSnapshot();
        });
    });
});
