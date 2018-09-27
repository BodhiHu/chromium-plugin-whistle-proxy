<template>
    <div @click="handleChange" class="switch-container">
        <span class="switch is-active" v-show="currentValue">
            <span class="core active"></span>
        </span>
        <span class="switch" v-show="!currentValue">
            <span class="core"></span>
        </span>
    </div>
</template>

<script>
    export default {
        name: "v-switch",
        data() {
            return {
                currentValue: false
            };
        },
        props: {
            value: {
                type: Boolean,
                required: true
            }
        },
        methods: {
            handleChange() {
                this.currentValue = !this.currentValue;
                this.$emit('input', this.currentValue);
                this.$emit('change', this.currentValue);
            }
        },
        watch: {
            value(val) {
                this.currentValue = val;
            }
        },
        mounted() {
            this.currentValue = this.value;
        }
    }
</script>

<style lang="scss" scoped>
    .switch-container {
        display: inline-block;
        cursor: pointer;
        .switch {
            margin: 0;
            display: inline-block;
            position: relative;
            width: 40px;
            height: 20px;
            border: 1px solid #dcdfe6;
            outline: none;
            border-radius: 10px;
            box-sizing: border-box;
            background: #dcdfe6;
            cursor: pointer;
            transition: border-color .3s, background-color .3s;
            vertical-align: middle;
            &.is-active {
                border-color: #409eff;
                background-color: #409eff;
                .core {
                    left: auto;
                    right: 1px;
                }
            }
            .core {
                position: absolute;
                top: 1px;
                left: 1px;
                border-radius: 100%;
                transition: all .3s;
                width: 16px;
                height: 16px;
                background-color: #fff;
            }
        }
    }
</style>