<svelte:options accessors />

<script lang="ts">
  // @ts-ignore
  import pausedIcon from "../public/pause.svg"
  // @ts-ignore
  import playingIcon from "../public/play.svg"
  
  export let paused
	
</script>

<div class='knob-container'>
  <div class="knob" on:pointerdown={()=>{paused = !paused}} >

    <!-- { if (paused) @html pause} -->
    {#if paused}
    {@html playingIcon}
    {/if}

    {#if !paused}
    {@html pausedIcon}
    {/if}


  
    <!-- <svg width='100%' height='100%' viewBox="0 0 100 100">
      <g fill="none" stroke="currentColor">
        <path stroke-width="10" d="M50 40 l0 -50" />
      </g>
    </svg> -->
  </div>
</div>

<style>
  .knob-container{
    &:hover{
      cursor: pointer;
    }
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    /* width: 40px;
    height: 40px; */
    aspect-ratio: 1/1;
    max-height: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: conic-gradient(from 45deg,
      var(--secondary-color) 0deg 15deg,
      var(--tertiary-color) 60deg 60deg,
      var(--darken-color) 120deg 240deg,
      var(--tertiary-color) 300deg 300deg,
      var(--secondary-color) 345deg 360deg
    );
    box-shadow: -.15em .15em .05em .02em rgba(0,0,0,0.3);
    border-radius: 50%;
  }  

  .knob {
    display: block;
    aspect-ratio: 1/1;
    height: 100%;
    /* height: 80%; */
    padding: 0;
    border-radius: 50%;
    color: var(--text-color);
    background-color: var(--tertiary-color);
    box-shadow: 0 0 .3em rgba(255, 255, 255, 0.3) inset;
    fill: white;
    transform-origin: 50% 50%;
  }

  .knob svg{
    width: 100%;
    height: 100%;
  }
</style>