const {stripIndent} = require('common-tags');
const {transformAsync} = require('@babel/core');

const getPlugin = options => [
    require.resolve('..'),
    {
        files: false,
        postcss: false,
        ...options,
    },
];

const defaultOptions = {
    root: __dirname,
    filename: __filename,
    babelrc: false,
    configFile: false,
    presets: [
        ['@babel/preset-react', {throwIfNamespace: false, useBuiltIns: true}],
    ],
    plugins: [getPlugin()],
};

const transformCode = (code, options = defaultOptions) =>
    transformAsync(stripIndent(code), options);

const transform = code => transformCode(code);
transform.with = params => code => transformCode(code, params);

describe('babel', () => {
    it('draft', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled, {css, use} from 'reshadow'

            const getStyles = ({color, padding, bg}) => css\`
                color: \${color};
                padding: \${padding}px;
                background: url(\${bg});

                \${mixin};
            \`

            const typo = css\`
                font-size: 20px;
            \`

            const padding = css\`
                padding: \${padding[0]}px \${padding[1]}px;
            \`

            const Button = () => styled\`
                color: red;
            \`(<button />)

            const MyButton = () => styled(typo)\`
                button {
                    background: red;
                }
            \`(
                <button />
            )

            const SuperButton = ({color}) => styled\`
                color: \${color};

                \${mixin};
                \${padding};

                &[disabled] {
                    \${transparent};
                }
            \`(
                <button />
            )

            const Lol = () => styled(typo)\`
                color: red;
            \`(
                <button disabled use:size="x" {...use({variant: 'normal'})} />
            )

            const Kek = () => styled(typo)\`
                color: red;
            \`(
                <use.container>
                    <button use:size={size} {...use(mods)} />
                    <use:content />
                    <lol as="span">help me</lol>
                    <Button as={x ? Container : 'hah'}>not me</Button>
                </use.container>
            )

            const Kok = () => styled(typo)\`
                color: red;
            \`(
                <use.container>
                    {items.map(x => styled(style2)(styled(style)(
                        <item>{x}</item>
                    )))}
                </use.container>
            )

            const KAKA = () => styled(styles)(
                a ? <button /> : <input />
            )

            const Button2 = ({size = 's', shape = 'rounded', ...props}) => styled\`
                button {
                    color: \${'red'};
                }

                button[type="button"] {
                    \${_color};
                    \${box({size, shape})};
                    \${typo({size})};
                    \${color('green')};
                    \${color('red')({hover: true})};
                }
            \`(<button type="button" {...props} />);
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform the code', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type}) => styled(styles)(
                <button type={type} disabled={disabled} use:theme="normal">
                    content
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform the nested code', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'
            import styles2 from './styles2'

            const App = ({disabled, type}) => styled(styles)(
                <button type={type} disabled={disabled} use:theme="normal">
                    {styled(styles2)(
                        <content>content</content>
                    )}

                    <button>click</button>
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform with css-in-js code', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            const App = ({disabled, type}) => styled\`
                button[disabled] {
                    color: red;
                }
            \`(
                <button type={type} disabled={disabled} use:theme="normal">
                    content
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform with css-in-js code with styles', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type}) => styled(styles)\`
                button[disabled] {
                    color: red;
                }
            \`(
                <button type={type} disabled={disabled} use:theme="normal">
                    content
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform with css-in-js code with variables', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type, color, bgcolor}) => styled(styles)\`
                button[disabled] {
                    color: \${color};
                    background-color: \${bgcolor};
                }
            \`(
                <button type={type} disabled={disabled} use:theme="normal">
                    content
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform with css-in-js code with variables without overhead', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'

            const App = ({color, bgcolor}) => styled(styles)\`
                button {
                    color: \${color};
                    background-color: \${bgcolor};
                }
            \`(
                <button>
                    content
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform with css-in-js code with variables and avoid duplication', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'

            const App = ({color}) => styled(styles)\`
                button {
                    color: \${color};
                    background-color: \${color};
                }
            \`(
                <button>
                    content
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform with css-in-js code with variables with string inline style', async () => {
        const {code} = await transform.with({
            ...defaultOptions,
            plugins: [getPlugin({stringStyle: true})],
        })`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type, color, bgcolor}) => styled(styles)\`
                button[disabled] {
                    color: \${color};
                    background-color: \${bgcolor};
                }
            \`(
                <button type={type} disabled={disabled} use:theme="normal">
                    content
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform with css-in-js code with variables with string inline style and avoid duplication', async () => {
        const {code} = await transform.with({
            ...defaultOptions,
            plugins: [getPlugin({stringStyle: true})],
        })`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type, color}) => styled(styles)\`
                button[disabled] {
                    color: \${color};
                    background-color: \${color};
                }
            \`(
                <button type={type} disabled={disabled} use:theme="normal">
                    content
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform with css-in-js code with variables in sibling nodes', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type, color, bgcolor}) => styled(styles)\`
                button[disabled] {
                    color: \${color};
                    background-color: \${bgcolor};
                }
            \`(
                <>
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                    <button type={type} disabled={disabled} use:theme="action">
                        content 2
                    </button>
                </>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform with css-in-js code with variables in nested elemnts', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type, color, bgcolor}) => styled\`
                div {
                    padding: 10px;
                }
            \`(
                <div>
                    {styled\`
                        button[disabled] {
                            color: \${color};
                            background-color: \${bgcolor};
                        }
                    \`(
                        <button type={type} disabled={disabled}>
                            content
                        </button>
                    )}
                </div>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should keep the links to styles if they cant hoist', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            import baseStyles from './styles'

            const App = ({disabled, styles, type, color, bgcolor}) => styled(styles, baseStyles)\`
                button {
                    color: red;
                }
            \`(
                <button type={type} disabled={disabled} use:theme="normal">
                    content
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform tag with namespace', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled, {use} from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type}) => styled(styles)(
                <use:button type={type} disabled={disabled}>
                    <use:content as="span">content</use:content>
                </use:button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform tag with dot element', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled, {use} from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type}) => styled(styles)(
                <use.button type={type} disabled={disabled}>
                    <use.content as="span">content</use.content>
                </use.button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should not transform tag with dot element that is not under `use` namespace', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type}) => styled(styles)(
                <components.button type={type} disabled={disabled}>
                    <content as="span">content</content>
                </components.button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should transform tag with just "as" attribute', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled, {use} from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type}) => styled(styles)(
                <button type={type} disabled={disabled}>
                    <content as="span">content</content>
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should use custom elementFallback', async () => {
        const {code} = await transform.with({
            ...defaultOptions,
            plugins: [getPlugin({elementFallback: 'span'})],
        })`
            import React from 'react'
            import styled, {use} from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type}) => styled(styles)(
                <button type={type} disabled={disabled}>
                    <content>content</content>
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should merge attributes well', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled, {use} from 'reshadow'

            import styles from './styles'

            const App = ({disabled, type, ...props}) => styled(styles)(
                <button
                    disabled
                    name="button"
                    {...props}
                    type="submit"
                    autofocus
                    use:theme="normal"
                    aria-hidden
                    {...use({size: 's'})}
                >
                    content
                </button>
            )

            export default App
        `;

        expect(code).toMatchSnapshot();
    });

    it('should work with just spread', async () => {
        const {code} = await transform`
            import React from 'react'
            import styled from 'reshadow'

            const Button = (props) => styled\`
                button {
                    padding: 5px 10px;
                }
            \`(
                <button {...props} />
            )

            export default Button
        `;

        expect(code).toMatchSnapshot();
    });

    describe('macro', () => {
        const options = {
            ...defaultOptions,
            plugins: ['babel-plugin-macros'],
        };

        it('should process module with macro', async () => {
            const {code} = await transform.with(options)`
                import React from 'react'
                import styled from '../../macro'

                const App = ({disabled, type}) => styled(styles)\`
                    button {
                        color: red;
                    }
                \`(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should process styles with comments', async () => {
            const {code} = await transform.with(options)`
                import React from 'react'
                import styled from '../../macro'

                const App = ({disabled, type}) => styled(styles)\`
                    /* extremely insightful comment */
                    button {
                        color: red;
                    }
                \`(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should NOT process a variable inside a comment', async () => {
            const {code} = await transform.with(options)`
                import React from 'react'
                import styled from '../../macro'

                const App = ({disabled, type}) => styled(styles)\`
                    /* extremely insightful comment w/ \${type} */
                    button {
                        color: red;
                        height: \${disabled};
                    }
                \`(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should NOT process a variable inside a comment, multiple comments', async () => {
            const {code} = await transform.with(options)`
                import React from 'react'
                import styled from '../../macro'
                import getHeight from './utils'

                const App = ({disabled, type}) => styled(styles)\`
                    /* extremely insightful comment w/ \${type} */
                    button {
                        /* yet another comment */
                        color: red;
                        height: \${disabled};
                        /* height: \${getHeight(type)}; */
                        background: \${color};
                    }
                \`(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should NOT process a variable inside a comment, multiple comments in a single quasi', async () => {
            const {code} = await transform.with(options)`
                import React from 'react'
                import styled from '../../macro'
                import getHeight from './utils'

                const App = ({disabled, type}) => styled(styles)\`
                    /* extremely insightful comment w/ \${type} */
                    button {
                        /* yet another comment */
                        color: red;
                        height: \${disabled};
                        /* height: \${getHeight(type)}; */
                        /* more comments */
                        background: \${color};
                    }
                \`(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should keep named imports', async () => {
            const {code} = await transform.with(options)`
                import React from 'react'
                import styled, {use} from '../../macro'

                const App = ({disabled, type}) => styled(styles)\`
                    button {
                        color: red;
                    }
                \`(
                    <button type={type} disabled={disabled} {...use({theme: 'normal'})}>
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should merge use', async () => {
            const {code} = await transform.with(options)`
                import React from 'react'
                import styled, {use} from '../../macro'

                const App = ({disabled, type}) => styled(styles)\`
                    button {
                        color: red;
                    }
                \`(
                    <button use:size="s" {...use({theme: 'normal'})}>
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });
    });

    describe('Vue', () => {
        const options = {
            ...defaultOptions,
            presets: [],
            plugins: [getPlugin({target: 'vue'})],
        };

        it('should group props right', async () => {
            const {code} = await transform.with(options)`
                import styled from 'reshadow'
                import styles from './styles'

                new Vue({
                    el: "#app",
                    render: h => styled(styles)\`
                        Button {color: \${color}}
                    \`(
                        <Button class="test" size="s" bgcolor="red" use:mod="value">
                            Red
                        </Button>
                    )
                });
            `;

            expect(code).toMatchSnapshot();
        });

        it('should pass classes', async () => {
            const {code} = await transform.with(options)`
                import styled from 'reshadow'
                import styles from './styles'

                new Vue({
                    el: "#app",
                    render: h => styled\`
                        Button + Button {
                            margin-left: 10px;
                        }
                    \`(
                        <div>
                            <Button size="s" bgcolor="red">
                                Red
                            </Button>
                            <Button size="m" bgcolor="rebeccapurple">
                                Rebeccapurple
                            </Button>
                        </div>
                    )
                });
            `;

            expect(code).toMatchSnapshot();
        });
    });

    describe('postcss', () => {
        it('should process styles and add them runtime', async () => {
            const {code} = await transform.with({
                ...defaultOptions,
                plugins: [getPlugin({postcss: true})],
            })`
                import React from 'react'
                import styled from 'reshadow'

                const App = ({disabled, type}) => styled\`
                    button {
                        color: red;
                    }
                \`(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should process styles with css', async () => {
            const {code} = await transform.with({
                ...defaultOptions,
                plugins: [getPlugin({postcss: true})],
            })`
                import React from 'react'
                import styled, {css} from 'reshadow'

                const styles = css\`
                    button {
                        color: red;
                    }
                \`

                const App = ({disabled, type}) => styled(styles)(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should process styles with css local name', async () => {
            const {code} = await transform.with({
                ...defaultOptions,
                plugins: [getPlugin({postcss: true})],
            })`
                import React from 'react'
                import styled, {css as localCss} from 'reshadow'

                const styles = localCss\`
                    button {
                        color: red;
                    }
                \`

                const App = ({disabled, type}) => styled(styles)(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should process styles from file', async () => {
            const {code} = await transform.with({
                ...defaultOptions,
                plugins: [getPlugin({postcss: true, files: /\.css$/})],
            })`
                import React from 'react'
                import styled from 'reshadow'

                import styles from './styles.css'

                const App = ({disabled, type}) => styled(styles)(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should inline styles from file but ignore them', async () => {
            const {code} = await transform.with({
                ...defaultOptions,
                plugins: [
                    getPlugin({
                        postcss: true,
                        files: /\.css$/,
                        processFiles: false,
                    }),
                ],
            })`
                import React from 'react'
                import styled from 'reshadow'

                import styles from './styles.css'

                const App = ({disabled, type}) => styled(styles)(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should work with css-modules imports', async () => {
            const {code} = await transform.with({
                ...defaultOptions,
                plugins: [getPlugin({postcss: true})],
            })`
                import React from 'react'
                import styled from 'reshadow'

                const App = ({disabled, type}) => styled\`
                    @value title from './classes.css';

                    button {
                        composes: title;

                        color: red;
                    }
                \`(
                    <button type={type} disabled={disabled} use:theme="normal">
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should use postcss-env', async () => {
            const {code} = await transform.with({
                ...defaultOptions,
                plugins: [
                    getPlugin({
                        postcss: {
                            options: {
                                presetEnv: {
                                    autoprefixer: {
                                        overrideBrowserslist: 'last 2 versions',
                                    },
                                },
                            },
                        },
                    }),
                ],
            })`
                import React from 'react'
                import styled from 'reshadow'

                const App = ({disabled, type}) => styled\`
                    button {
                        transition: 1s;
                    }
                \`(
                    <button type={type} disabled={disabled}>
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });

        it('should use cssnano', async () => {
            const {code} = await transform.with({
                ...defaultOptions,
                plugins: [
                    getPlugin({
                        postcss: {
                            options: {
                                cssnano: true,
                            },
                        },
                    }),
                ],
            })`
                import React from 'react'
                import styled from 'reshadow'

                const App = ({disabled, type}) => styled\`
                    button {
                        display: grid;
                    }
                \`(
                    <button type={type} disabled={disabled}>
                        content
                    </button>
                )

                export default App
            `;

            expect(code).toMatchSnapshot();
        });
    });
});
