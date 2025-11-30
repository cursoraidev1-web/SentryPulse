<?php

namespace App\Core;

use ReflectionClass;
use ReflectionException;

class Container
{
    protected array $bindings = [];
    protected array $instances = [];

    public function bind(string $abstract, callable $concrete): void
    {
        $this->bindings[$abstract] = [
            'concrete' => $concrete,
            'shared' => false,
        ];
    }

    public function singleton(string $abstract, callable $concrete): void
    {
        $this->bindings[$abstract] = [
            'concrete' => $concrete,
            'shared' => true,
        ];
    }

    public function make(string $abstract)
    {
        if (isset($this->instances[$abstract])) {
            return $this->instances[$abstract];
        }

        if (isset($this->bindings[$abstract])) {
            $concrete = $this->bindings[$abstract]['concrete'];
            $object = $concrete($this);

            if ($this->bindings[$abstract]['shared']) {
                $this->instances[$abstract] = $object;
            }

            return $object;
        }

        return $this->resolve($abstract);
    }

    protected function resolve(string $abstract)
    {
        try {
            $reflector = new ReflectionClass($abstract);
        } catch (ReflectionException $e) {
            throw new \Exception("Target class [{$abstract}] does not exist.");
        }

        if (!$reflector->isInstantiable()) {
            throw new \Exception("Target [{$abstract}] is not instantiable.");
        }

        $constructor = $reflector->getConstructor();

        if (is_null($constructor)) {
            return new $abstract;
        }

        $dependencies = $constructor->getParameters();
        $instances = $this->resolveDependencies($dependencies);

        return $reflector->newInstanceArgs($instances);
    }

    protected function resolveDependencies(array $dependencies): array
    {
        $results = [];

        foreach ($dependencies as $dependency) {
            $type = $dependency->getType();
            
            if ($type && !$type->isBuiltin()) {
                $results[] = $this->make($type->getName());
            } elseif ($dependency->isDefaultValueAvailable()) {
                $results[] = $dependency->getDefaultValue();
            } else {
                throw new \Exception("Unresolvable dependency resolving [{$dependency}]");
            }
        }

        return $results;
    }
}
