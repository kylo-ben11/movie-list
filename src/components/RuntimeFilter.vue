<template>
  <div class="runtimeFilter__container grid">
    <label>Enter Max<br />Runtime:</label>
    <input
      type="number"
      :value="maxRuntime"
      @input="$emit('update:maxRuntime', $event.target.value)"
    />
  </div>
</template>
<script>
export default {
  props: ['maxRuntime'],
  emits: ['update:maxRuntime'],
};
</script>
