<script lang="ts">

  // import type monaco from 'monaco-editor';
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';
  import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import { _monaco } from 'store';
  import { get } from 'svelte/store';
  import initMonaco from 'initMonaco'
  // import ts, { Diagnostic } from "typescript";
  // import internal from 'stream'
  // import Test from 'Test.svelte'

  import Knob from 'Knob.svelte'
  // console.log(Knob)
  (Knob)

  export let monaco: typeof Monaco;
  // const eslint = require('eslint');
  // import eslint from 'eslint';
  // const { Linter } = eslint;
  // const linter = new Linter();


  // @ts-ignore
  let editorContainer: HTMLElement;
  let error: any = "";

  let webAudio: AudioContext;

  let midiAccess: MIDIAccess;
  let outputs: Array<MIDIOutput> = [];
  
  async function initMidi(){
    midiAccess = await navigator.requestMIDIAccess()
    let i = 0;
    for(const output of midiAccess.outputs.values()) {
      outputs[i] = output;
      output
      i++;
      console.log(output);
    }
    if(i == 0)
      alert("No midi outputs")

  }
  
  let main_loop: number;


  onMount(async () => {

    window.webAudio = webAudio = new AudioContext()
    window.intervals = []
    window.loops = []
    let timeouts: Array<NodeJS.Timeout> = []
    // @ts-ignore
    window.timeouts = timeouts

    await initMidi();


    const NOTE_ON = 0x90;
    const NOTE_OFF = 0x80;

    const code_prepend = `
    const BPM = 128;
    const msr = 128./60.;
    const sixbar = msr/4;
    const bar = msr/16;
    const beat = bar/4;
    const qnote = beat/4;
    `;
    
    

    const play = (ch: number, t: number, note: number, len: number = 0.2, vel: number = 1)=>{
      if(t < 0)
        return
      let timeout_start = setTimeout(()=>{
        outputs[0].send([NOTE_ON + ch, 41 + note, vel*127]);
        let timeout_stop = setTimeout(()=>{
          outputs[0].send([NOTE_OFF + ch, 41 + note, vel*127]);
          timeouts.splice(timeouts.indexOf(timeout_stop),1)
        }, 1000 * len)
        timeouts.splice(timeouts.indexOf(timeout_start),1)
        timeouts.push(timeout_stop)
      }, 60*1000*t)
      timeouts.push(timeout_start)
      // setTimeout(()=>{
      //   outputs[ch].send([NOTE_OFF, 41 + note, 0x7f]);
      // }, 60*1000*(t+len))
    }

    let [_monaco, vimContext] = await initMonaco(
      editorContainer,
      async (
        editor,
        monaco
        )=>{
        const model = monaco.editor.getModels()[0];
        monaco.editor.setModelMarkers(model, 'owner', []);

        let ts_code = editor.getValue()
        // console.log(ts_code)
        // let trans = ts.transpileModule(
        //   ts_code, {
        //     reportDiagnostics: true,
        //   }
        // )
        // let js_code = trans.outputText;
        let js_code = ts_code;
        
        

        const worker_code = `
          const webAudio = { currentTime: 0 };
          const intervals = [];
          const loops = []; const play = (ch, t, note, len = 0.2, vel = 128)=>{};
        ` + code_prepend + js_code;
        
        const worker = new Worker(URL.createObjectURL(new Blob([worker_code])));
        let succ_compile = true;
        worker.onerror = (e) => { // error while compiling code
            let line = e.lineno - 4 - 7;
            monaco.editor.setModelMarkers(model, 'owner', [
              {
                startLineNumber: line,
                startColumn: e.colno,
                endLineNumber: line,
                endColumn: model.getLineMaxColumn(line),
                message: e.message,
                severity: e.type === "error" ?  monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning
              }
            ]);
            error = e.message
            console.log(e)
            succ_compile = false;

            worker.terminate();
            e.preventDefault();
        };
        
        setTimeout(()=>{
          
          try{ worker.terminate(); } catch(e){}

          // const new = new Worker(URL.createObjectURL(new Blob([js_code])));

          if(succ_compile){
            error = ""
            try {
              for(let timeout of timeouts){
                clearTimeout(timeout)
              }
              timeouts.length = 0
              for(let output of outputs){
                for(let i = 0; i < 128; i++){
                  output.send([NOTE_OFF, i, 0x7f]);
                }
              }
              window.loops.length = 0
              for(let interval of window.intervals){
                clearInterval(interval)
              }
              window.intervals.length = 0
              let fn = new Function("webAudio","intervals", "loops", "play", code_prepend + js_code)
              fn(window.webAudio, window.intervals, window.loops, play)
              
              window.intervals.length = window.loops.length
              
              let i = 0
              for(let loop of window.loops){
                let loop_t: number = loop.time * 60
                let t_offs = webAudio.currentTime % loop_t
                loop(t_offs)
                let t_left = loop_t - t_offs
                let _i = i;
                timeouts.push(
                  setTimeout(()=>{
                    // @ts-ignore
                    window.intervals[_i] = setInterval(
                      ()=>{loop(0)},
                      loop_t * 1000
                    )
                  }, t_left * 1000)
                )
                i++
              }
            } catch (_error) {
              console.log(_error)
              console.log("asdgadsgasg")
              // @ts-ignore
              console.log(_error.stack.split("\n")[4])
              alert(_error)
              error = _error;
            }
          }
        }, 200);

        }
      );
    monaco = _monaco

  });

  onDestroy(() => {
      monaco?.editor.getModels().forEach((model) => model.dispose());
  });
	// import Nested from './Nested.svelte';

	export let name: string;
  let cnt: number = 0;
  

  $: console.log('the count is ' + cnt);

</script>

<main>
  <div id="bar">
    <div id="error">{error}</div>
    <!-- svelte-ignore missing-declaration -->
    <Knob max={1} min={0} value={0} />
    <!-- <Test></Test> -->
    <!-- <h1>Hello {name}!</h1>
    <h1>{cnt.toString()}</h1>
    <button on:click={()=>{cnt++}}>inc</button> -->
    <!-- <p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p> -->
  </div>
  <div id="monaco" bind:this={editorContainer}></div>
</main>

<style lang="scss">
  #bar{
    background: black;
    width: 100%;
    height: 100px;
    *{
      color: white;
      font-family: "Jetbrains Mono";
    }
    #error {
      font-size: 0.78rem;
      background-color: rgb(136, 18, 10);
    }
  }
  /* #bottom *{
  } */
  #monaco{
    width: 100%;
    height: 100%;
  }
  
	main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
