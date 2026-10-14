/**
 * Test-only stub: react-markdown ships ESM-only code that ts-jest (node env)
 * cannot parse. The SSR server bundles the real package via webpack; specs that
 * transitively import @mkaciuba/ui-kit only need this module to be loadable.
 */
const ReactMarkdownStub: any = () => null;

export default ReactMarkdownStub;
