<?php

namespace App\Models;

class User
{
    public int $id;
    public string $name;
    public string $email;
    public ?string $email_verified_at;
    public string $password;
    public ?string $avatar;
    public string $timezone;
    public ?string $last_login_at;
    public string $created_at;
    public string $updated_at;

    public static function fromArray(array $data): self
    {
        $user = new self();
        foreach ($data as $key => $value) {
            if (property_exists($user, $key)) {
                $user->$key = $value;
            }
        }
        return $user;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'timezone' => $this->timezone,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
