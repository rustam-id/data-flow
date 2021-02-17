const cron = require('node-cron');

// запуск декорируемой ф-и по cron
export function startByCron(schedule: string) {
    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
        return cron.schedule(schedule, () => {
            if (process.env.CRON_DISABLE === 'true') {
                return
            }
            descriptor.value()
        });
    }
}
// повторный запуск декорируемой ф-ии чз заданное время ожидания
export function tryItAgain(attemptsNumber: number = 1, delayBetweenAttempts: number = 0) {
    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
        let oldFunc = descriptor.value;
        descriptor.value = async function (...args: any) {
            let counter: number = 0
            let data: any[] = []
            while (counter < attemptsNumber) {
                data = await oldFunc(...args)
                let status = !!(data)
                if (status) break
                // добавление паузы перед повторным запуском
                await new Promise(resolve => setTimeout(() => {
                    counter++
                    resolve()
                }, delayBetweenAttempts));
            }
            if (counter === attemptsNumber) {
                return false
            }
            return data
        }
    }
}
