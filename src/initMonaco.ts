
import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default async(
  editorContainer: HTMLElement
):Promise<[typeof Monaco, any]>=>{
    // Remove this line to load the monaco editor from a CDN
    // see https://www.npmjs.com/package/@monaco-editor/loader#config
    // loader.config({ paths: { vs: '/node_modules/monaco-editor/min/vs' } });
    // monaco = ;

    let monaco: typeof Monaco;
    let vimContext: any;
    monaco = await loader.init();
    // _monaco.set(monaco)
    // monaco = get(_monaco);

    // monaco
   // Sample
    const editor = monaco.editor.create(
    editorContainer, 
    {
      // 'bracketPairColorization.enabled': true,
      bracketPairColorization: {
        enabled: true
      },
      theme: "vs-dark",
      // scrollbar: {
      //     vertical: 'auto',
      //     horizontal: 'auto'
      // },
      mouseWheelZoom: true,
      automaticLayout: true,
    });
    let monokai = await import('monaco-themes/themes/Monokai.json');
    // @ts-ignore

    console.log(monokai);
    // @ts-ignore
    monaco.editor.defineTheme('monokai', monokai);
    monaco.editor.setTheme("monokai");
    // monaco.editor.setTheme("vs");
    // editor.updateOptions()
    const model = monaco.editor.createModel(
      "console.log('Hello from Monaco! (the editor, not the city...)')",
      undefined,
      // Give monaco a hint which syntax highlighting to use
      monaco.Uri.file('sample.js')
    );
    editor.setModel(model);
    // @ts-ignore
    window.require.config({
      paths: {
          'monaco-vim': 'https://unpkg.com/monaco-vim/dist/monaco-vim'
      }
    });
    // @ts-ignore
    window.require(['monaco-vim'], MonacoVim => {
      const statusNode = document.querySelector('.vim-status');
      vimContext = MonacoVim.initVimMode(editor, statusNode);
    });
    return [monaco, vimContext]
}