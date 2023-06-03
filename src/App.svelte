<script lang="ts">
  // import type monaco from 'monaco-editor';
  import { onMount } from 'svelte';
  import { onDestroy } from 'svelte';
  import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
  import { _monaco } from 'store';
  import { get } from 'svelte/store';
    import initMonaco from 'initMonaco'

  export let monaco: typeof Monaco;
  // @ts-ignore
  let editorContainer: HTMLElement;

  let midiAccess: MIDIAccess;
  let midiOutput: MIDIOutput;

  onMount(async () => {
    let [_monaco, vimContext] = await initMonaco(editorContainer);
    monaco = _monaco
    // let monaco: typeof Monaco = $monaco;

    midiAccess = await navigator.requestMIDIAccess()
    const outputs = midiAccess.outputs.values();
    let i = 0;
    for(const output of outputs) {
      midiOutput = output;
      i++;
      break;
    }
    console.log(midiOutput);
    if(i == 0)
      alert("No midi outputs")


    const NOTE_ON = 0x90;
    const NOTE_OFF = 0x80;
    setInterval(()=>{
      midiOutput.send([NOTE_ON, 41, 0x7f]);
      
      setTimeout(()=>{
        midiOutput.send([NOTE_OFF, 41, 0x7f]);

      }, 100);

      // midiOutput.send([0b10000000, 0b00011100, 0b01111111]);

    },1000);

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
  <div id="monaco" bind:this={editorContainer}></div>
	<h1>Hello {name}!</h1>
	<h1>{cnt.toString()}</h1>
  <button on:click={()=>{cnt++}}>inc</button>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>

<style>
  #monaco{
    width: 100%;
    height: 100%;
  }
  
	main {
    width: 100%;
    height: 100%;
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
