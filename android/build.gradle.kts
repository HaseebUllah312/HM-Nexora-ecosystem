allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}

subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    val applyCompileSdk = {
        val android = project.extensions.findByName("android")
        if (android != null) {
            for (m in android.javaClass.methods) {
                if (m.name == "setCompileSdk" || m.name == "setCompileSdkVersion") {
                    try {
                        if (m.parameterTypes.size == 1) {
                            val paramType = m.parameterTypes[0]
                            if (paramType == Int::class.javaPrimitiveType || paramType == java.lang.Integer::class.java) {
                                m.invoke(android, 36)
                            } else if (paramType == String::class.java) {
                                m.invoke(android, "android-36")
                            }
                        }
                    } catch (_: Exception) {}
                }
            }
        }
    }

    if (project.state.executed) {
        applyCompileSdk()
    } else {
        project.afterEvaluate { applyCompileSdk() }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
